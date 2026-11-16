from datetime import datetime, time

from sqlalchemy import func
from sqlmodel import Session, col, select

from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import Pedido


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Pedido)

    def _listar(
        self, usuario_id: int | None, estado: str | None, skip: int, limit: int
    ) -> tuple[int, list[Pedido]]:
        filtros = []
        if usuario_id is not None:
            filtros.append(Pedido.usuario_id == usuario_id)
        if estado is not None:
            filtros.append(Pedido.estado == estado)

        total = self.session.exec(select(func.count()).select_from(Pedido).where(*filtros)).one()
        statement = (
            select(Pedido).where(*filtros).order_by(col(Pedido.created_at).desc()).offset(skip).limit(limit)
        )
        return total, list(self.session.exec(statement).all())

    def list_by_usuario(
        self, usuario_id: int, estado: str | None = None, skip: int = 0, limit: int = 20
    ) -> tuple[int, list[Pedido]]:
        return self._listar(usuario_id, estado, skip, limit)

    def list_todos(
        self, estado: str | None = None, skip: int = 0, limit: int = 20
    ) -> tuple[int, list[Pedido]]:
        return self._listar(None, estado, skip, limit)

    def count_by_estado(self, estado: str) -> int:
        statement = select(func.count(col(Pedido.id))).where(Pedido.estado == estado)
        return self.session.exec(statement).one()

    def count_desde(self, desde: datetime) -> int:
        statement = select(func.count(col(Pedido.id))).where(Pedido.created_at >= desde)
        return self.session.exec(statement).one()

    def count_hoy(self) -> int:
        inicio_del_dia = datetime.combine(datetime.now().date(), time.min)
        return self.count_desde(inicio_del_dia)

    def sum_total_by_estado(self, estado: str) -> float:
        statement = select(func.coalesce(func.sum(Pedido.total), 0)).where(Pedido.estado == estado)
        return float(self.session.exec(statement).one())
