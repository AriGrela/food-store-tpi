from collections.abc import Generator

from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

# SQLite necesita este parametro para usarse desde varios hilos (FastAPI)
connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(settings.DATABASE_URL, echo=False, connect_args=connect_args)


def importar_modelos() -> None:
    """Importa todos los modelos para que SQLModel conozca las tablas y relaciones."""
    from app.modules.usuarios import models as _usuarios  # noqa: F401
    from app.modules.categorias import models as _categorias  # noqa: F401
    from app.modules.productos import models as _productos  # noqa: F401
    from app.modules.pedidos import models as _pedidos  # noqa: F401


def create_all_tables() -> None:
    importar_modelos()
    SQLModel.metadata.create_all(engine)


def session_factory() -> Session:
    return Session(engine)


def get_session() -> Generator[Session, None, None]:
    """Dependencia de FastAPI que entrega una sesion (se usa en deps.py)."""
    with session_factory() as session:
        yield session
