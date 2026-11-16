from sqlalchemy import func
from sqlmodel import Session, select

from app.core.base_repository import BaseRepository
from app.modules.categorias.models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Categoria)

    def get_by_nombre(self, nombre: str) -> Categoria | None:
        # busca tambien entre las dadas de baja: la baja no libera el nombre
        statement = select(Categoria).where(func.lower(Categoria.nombre) == nombre.strip().lower())
        return self.session.exec(statement).first()

    def listar_activas(self) -> list[Categoria]:
        statement = select(Categoria).where(Categoria.activo == True).order_by(Categoria.nombre)  # noqa: E712
        return list(self.session.exec(statement).all())
