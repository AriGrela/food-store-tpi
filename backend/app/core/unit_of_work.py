from collections.abc import Callable
from types import TracebackType

from sqlmodel import Session

from app.core.database import session_factory


class UnitOfWork:
    """
    Unit of Work base.
    - En __enter__ abre la sesion y crea los repositorios (cada modulo los define).
    - En __exit__ hace commit si no hubo error, rollback si hubo, y siempre cierra.
    Ningun service ni router llama a session.commit(), solo esta clase.
    """

    def __init__(self, factory: Callable[[], Session] = session_factory) -> None:
        self._factory = factory
        self._session: Session | None = None

    @property
    def session(self) -> Session:
        if self._session is None:
            raise RuntimeError("La sesion solo existe dentro del bloque 'with uow'")
        return self._session

    def __enter__(self) -> "UnitOfWork":
        self._session = self._factory()
        self._crear_repositorios()
        return self

    def _crear_repositorios(self) -> None:
        """Las subclases crean aca sus repositorios usando self.session."""

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc: BaseException | None,
        tb: TracebackType | None,
    ) -> None:
        try:
            if exc_type is None:
                self.session.commit()
            else:
                self.session.rollback()
        finally:
            self.session.close()
            self._session = None
