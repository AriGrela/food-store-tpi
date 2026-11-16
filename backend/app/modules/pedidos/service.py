from datetime import datetime

from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.schemas import (
    EstadoPedido,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork


# ---- Excepciones de dominio ----
class ErrorPedido(Exception):
    """Base de las excepciones del modulo. El mensaje se usa como detail."""

    mensaje = "Error en el pedido"

    def __init__(self, mensaje: str | None = None) -> None:
        super().__init__(mensaje or self.mensaje)
        self.mensaje = mensaje or self.mensaje


class PedidoNoEncontrado(ErrorPedido):
    mensaje = "Pedido no encontrado"


class ProductoNoEncontrado(ErrorPedido):
    mensaje = "Producto no encontrado"


class PedidoAjeno(ErrorPedido):
    mensaje = "No tenés permiso para ver o modificar este pedido"


class ProductoNoDisponible(ErrorPedido):
    mensaje = "Producto no disponible"


class StockInsuficiente(ErrorPedido):
    mensaje = "Stock insuficiente"


class ProductoRepetido(ErrorPedido):
    mensaje = "Hay productos repetidos en el pedido"


class TransicionInvalida(ErrorPedido):
    mensaje = "Transición de estado inválida"


class PedidoNoCancelable(ErrorPedido):
    mensaje = "Solo se pueden cancelar pedidos en estado PENDIENTE"


# ---- Maquina de estados (RN-02) ----
TRANSICIONES: dict[EstadoPedido, set[EstadoPedido]] = {
    EstadoPedido.PENDIENTE: {EstadoPedido.EN_PREPARACION, EstadoPedido.CANCELADO},
    EstadoPedido.EN_PREPARACION: {EstadoPedido.ENTREGADO, EstadoPedido.CANCELADO},
    EstadoPedido.ENTREGADO: set(),  # terminal
    EstadoPedido.CANCELADO: set(),  # terminal
}


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork) -> None:
        self.uow = uow

    # ---------- helpers ----------
    @staticmethod
    def _obtener(uow: PedidoUnitOfWork, pedido_id: int) -> Pedido:
        pedido = uow.pedidos.get_by_id(pedido_id)
        if pedido is None:
            raise PedidoNoEncontrado()
        return pedido

    @staticmethod
    def _restituir_stock(uow: PedidoUnitOfWork, pedido: Pedido) -> None:
        """RN-03: devuelve al stock las cantidades de cada linea."""
        for detalle in pedido.items:
            producto = uow.productos.get_by_id(detalle.producto_id)
            if producto is not None:
                producto.stock += detalle.cantidad
                uow.session.add(producto)

    # ---------- RN-01: crear pedido ----------
    def crear(self, data: PedidoCreate, usuario_id: int) -> PedidoRead:
        with self.uow as uow:
            ids = [item.producto_id for item in data.items]
            if len(ids) != len(set(ids)):
                raise ProductoRepetido()

            pedido = Pedido(
                usuario_id=usuario_id,
                estado=EstadoPedido.PENDIENTE.value,
                forma_pago=data.forma_pago.value,
                direccion_entrega=data.direccion_entrega.strip(),
                notas=data.notas,
                total=0,
            )
            uow.pedidos.add(pedido)

            total = 0.0
            for item in data.items:
                producto = uow.productos.get_by_id(item.producto_id)
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado(f"Producto {item.producto_id} no encontrado")
                if not producto.disponible:
                    raise ProductoNoDisponible(f"'{producto.nombre}' no está disponible")
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(
                        f"Stock insuficiente para '{producto.nombre}' (quedan {producto.stock})"
                    )

                # descuento el stock en la misma iteracion
                producto.stock -= item.cantidad
                uow.session.add(producto)

                # copio nombre y precio para que el pedido no cambie si cambia el producto
                subtotal = round(producto.precio_base * item.cantidad, 2)
                pedido.items.append(
                    DetallePedido(
                        producto_id=producto.id or 0,
                        cantidad=item.cantidad,
                        nombre_producto=producto.nombre,
                        precio_unitario=producto.precio_base,
                        subtotal=subtotal,
                    )
                )
                total += subtotal

            pedido.total = round(total, 2)
            uow.session.add(pedido)
            uow.session.flush()
            uow.session.refresh(pedido)
            # si algo fallo arriba, el __exit__ del UoW hace rollback y no se guarda nada
            return PedidoRead.model_validate(pedido)

    # ---------- consultas ----------
    def listar(
        self, usuario_id: int, es_admin: bool, estado: EstadoPedido | None, skip: int, limit: int
    ) -> PedidosPaginados:
        with self.uow as uow:
            estado_str = estado.value if estado else None
            if es_admin:
                total, pedidos = uow.pedidos.list_todos(estado_str, skip, limit)
            else:
                total, pedidos = uow.pedidos.list_by_usuario(usuario_id, estado_str, skip, limit)
            return PedidosPaginados(total=total, items=[PedidoRead.model_validate(p) for p in pedidos])

    def obtener(self, pedido_id: int, usuario_id: int, es_admin: bool) -> PedidoRead:
        with self.uow as uow:
            pedido = self._obtener(uow, pedido_id)
            # RN-04: el cliente solo ve sus pedidos
            if not es_admin and pedido.usuario_id != usuario_id:
                raise PedidoAjeno()
            return PedidoRead.model_validate(pedido)

    # ---------- RN-02 / RN-03: cambio de estado (admin) ----------
    def cambiar_estado(self, pedido_id: int, nuevo_estado: EstadoPedido) -> PedidoRead:
        with self.uow as uow:
            pedido = self._obtener(uow, pedido_id)
            actual = EstadoPedido(pedido.estado)

            if nuevo_estado not in TRANSICIONES[actual]:
                raise TransicionInvalida(
                    f"No se puede pasar de {actual.value} a {nuevo_estado.value}"
                )

            if nuevo_estado == EstadoPedido.CANCELADO:
                self._restituir_stock(uow, pedido)

            pedido.estado = nuevo_estado.value
            pedido.updated_at = datetime.now()
            uow.session.add(pedido)
            return PedidoRead.model_validate(pedido)

    # ---------- RN-03 / RN-04: cancelar (cliente duenio) ----------
    def cancelar(self, pedido_id: int, usuario_id: int) -> PedidoRead:
        with self.uow as uow:
            pedido = self._obtener(uow, pedido_id)
            if pedido.usuario_id != usuario_id:
                raise PedidoAjeno()
            if pedido.estado != EstadoPedido.PENDIENTE.value:
                raise PedidoNoCancelable()

            self._restituir_stock(uow, pedido)
            pedido.estado = EstadoPedido.CANCELADO.value
            pedido.updated_at = datetime.now()
            uow.session.add(pedido)
            return PedidoRead.model_validate(pedido)

    # ---------- resumen para el panel ----------
    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            return ResumenPedidos(
                pendientes=uow.pedidos.count_by_estado(EstadoPedido.PENDIENTE.value),
                en_preparacion=uow.pedidos.count_by_estado(EstadoPedido.EN_PREPARACION.value),
                entregados=uow.pedidos.count_by_estado(EstadoPedido.ENTREGADO.value),
                cancelados=uow.pedidos.count_by_estado(EstadoPedido.CANCELADO.value),
                pedidos_hoy=uow.pedidos.count_hoy(),
                ingresos_entregados=round(
                    uow.pedidos.sum_total_by_estado(EstadoPedido.ENTREGADO.value), 2
                ),
            )
