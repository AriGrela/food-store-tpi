from sqlmodel import SQLModel

# auth reutiliza los schemas del modulo usuarios
from app.modules.usuarios.schemas import UserCreate, UserPublic

__all__ = ["UserCreate", "UserPublic", "MensajeResponse"]


class MensajeResponse(SQLModel):
    message: str
