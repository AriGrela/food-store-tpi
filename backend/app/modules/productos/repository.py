from sqlalchemy import func
from sqlmodel import Session, col, select

from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Producto)

    def search(
        self,
        search: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[int, list[Producto]]:
        """Listado paginado de productos activos con filtros. Devuelve (total, items)."""
        filtros = [Producto.activo == True]  # noqa: E712
        if search:
            # sin distinguir mayusculas
            filtros.append(func.lower(Producto.nombre).contains(search.strip().lower()))
        if categoria_id is not None:
            filtros.append(Producto.categoria_id == categoria_id)
        if disponible is not None:
            filtros.append(Producto.disponible == disponible)

        total = self.session.exec(select(func.count()).select_from(Producto).where(*filtros)).one()
        statement = select(Producto).where(*filtros).order_by(col(Producto.id)).offset(skip).limit(limit)
        items = list(self.session.exec(statement).all())
        return total, items
