from typing import Generic, TypeVar

from sqlmodel import Session, SQLModel, select

T = TypeVar("T", bound=SQLModel)


class BaseRepository(Generic[T]):
    """Repositorio generico con las operaciones basicas. No tiene reglas de negocio."""

    def __init__(self, session: Session, model: type[T]) -> None:
        self.session = session
        self.model = model

    def get_by_id(self, id: int) -> T | None:
        return self.session.get(self.model, id)

    def get_all(self, skip: int = 0, limit: int = 100) -> list[T]:
        statement = select(self.model).offset(skip).limit(limit)
        return list(self.session.exec(statement).all())

    def add(self, obj: T) -> T:
        # flush para que la base le asigne el id, pero el commit lo hace el UoW
        self.session.add(obj)
        self.session.flush()
        self.session.refresh(obj)
        return obj

    def delete(self, obj: T) -> None:
        self.session.delete(obj)
        self.session.flush()
