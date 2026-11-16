from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import get_current_active_user, require_role
from app.modules.pedidos.schemas import (
    CambioEstado,
    EstadoPedido,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.service import (
    ErrorPedido,
    PedidoAjeno,
    PedidoNoEncontrado,
    PedidoService,
    ProductoNoEncontrado,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.usuarios.models import Usuario

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])

solo_admin = require_role(["admin"])


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())


def a_http(error: ErrorPedido) -> HTTPException:
    """Traduce las excepciones de dominio a codigos HTTP."""
    if isinstance(error, (PedidoNoEncontrado, ProductoNoEncontrado)):
        codigo = status.HTTP_404_NOT_FOUND
    elif isinstance(error, PedidoAjeno):
        codigo = status.HTTP_403_FORBIDDEN
    else:
        # StockInsuficiente, ProductoNoDisponible, ProductoRepetido, TransicionInvalida, etc.
        codigo = status.HTTP_400_BAD_REQUEST
    return HTTPException(status_code=codigo, detail=error.mensaje)


@router.post("", response_model=PedidoRead, status_code=status.HTTP_201_CREATED)
def crear_pedido(
    data: PedidoCreate,
    usuario: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
) -> PedidoRead:
    try:
        return service.crear(data, usuario_id=usuario.id or 0)
    except ErrorPedido as e:
        raise a_http(e)


@router.get("", response_model=PedidosPaginados)
def listar_pedidos(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    estado: EstadoPedido | None = Query(None),
    usuario: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
) -> PedidosPaginados:
    return service.listar(usuario.id or 0, usuario.role == "admin", estado, skip, limit)


# OJO: /resumen tiene que ir antes que /{pedido_id}
@router.get("/resumen", response_model=ResumenPedidos)
def resumen_pedidos(
    _: Usuario = Depends(solo_admin),
    service: PedidoService = Depends(get_pedido_service),
) -> ResumenPedidos:
    return service.resumen()


@router.get("/{pedido_id}", response_model=PedidoRead)
def obtener_pedido(
    pedido_id: int,
    usuario: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
) -> PedidoRead:
    try:
        return service.obtener(pedido_id, usuario.id or 0, usuario.role == "admin")
    except ErrorPedido as e:
        raise a_http(e)


@router.patch("/{pedido_id}/estado", response_model=PedidoRead)
def cambiar_estado(
    pedido_id: int,
    data: CambioEstado,
    _: Usuario = Depends(solo_admin),
    service: PedidoService = Depends(get_pedido_service),
) -> PedidoRead:
    try:
        return service.cambiar_estado(pedido_id, data.estado)
    except ErrorPedido as e:
        raise a_http(e)


@router.patch("/{pedido_id}/cancelar", response_model=PedidoRead)
def cancelar_pedido(
    pedido_id: int,
    usuario: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
) -> PedidoRead:
    try:
        return service.cancelar(pedido_id, usuario.id or 0)
    except ErrorPedido as e:
        raise a_http(e)
