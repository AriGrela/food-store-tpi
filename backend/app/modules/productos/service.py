from app.modules.productos.models import Producto
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork


# ---- Excepciones de dominio ----
class ProductoNoEncontrado(Exception):
    pass


class CategoriaNoEncontrada(Exception):
    """La categoria indicada no existe o esta dada de baja."""


class ProductoService:
    def __init__(self, uow: ProductoUnitOfWork) -> None:
        self.uow = uow

    def _obtener_activo(self, uow: ProductoUnitOfWork, producto_id: int) -> Producto:
        producto = uow.productos.get_by_id(producto_id)
        if producto is None or not producto.activo:
            raise ProductoNoEncontrado()
        return producto

    def _validar_categoria(self, uow: ProductoUnitOfWork, categoria_id: int) -> None:
        categoria = uow.categorias.get_by_id(categoria_id)
        if categoria is None or not categoria.activo:
            raise CategoriaNoEncontrada()

    def listar(
        self,
        skip: int,
        limit: int,
        search: str | None,
        categoria_id: int | None,
        disponible: bool | None,
    ) -> ProductosPaginados:
        with self.uow as uow:
            total, productos = uow.productos.search(search, categoria_id, disponible, skip, limit)
            return ProductosPaginados(
                total=total, items=[ProductoRead.model_validate(p) for p in productos]
            )

    def obtener(self, producto_id: int) -> ProductoRead:
        with self.uow as uow:
            return ProductoRead.model_validate(self._obtener_activo(uow, producto_id))

    def crear(self, data: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            self._validar_categoria(uow, data.categoria_id)
            producto = Producto.model_validate(data)
            uow.productos.add(producto)
            return ProductoRead.model_validate(producto)

    def actualizar(self, producto_id: int, data: ProductoUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = self._obtener_activo(uow, producto_id)
            # saco los None de campos obligatorios para no romper nada
            cambios = {
                k: v
                for k, v in data.model_dump(exclude_unset=True).items()
                if v is not None or k in ("descripcion", "imagen_url")
            }
            if "categoria_id" in cambios:
                self._validar_categoria(uow, cambios["categoria_id"])

            producto.sqlmodel_update(cambios)
            uow.session.add(producto)
            uow.session.flush()
            uow.session.refresh(producto)
            return ProductoRead.model_validate(producto)

    def actualizar_stock(self, producto_id: int, data: ProductoStockUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = self._obtener_activo(uow, producto_id)
            producto.stock = data.stock
            producto.disponible = data.disponible
            uow.session.add(producto)
            return ProductoRead.model_validate(producto)

    def eliminar(self, producto_id: int) -> None:
        with self.uow as uow:
            producto = self._obtener_activo(uow, producto_id)
            producto.activo = False  # baja logica, no se borra
            uow.session.add(producto)
