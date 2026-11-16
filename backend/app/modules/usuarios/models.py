from datetime import datetime
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.pedidos.models import Pedido


class Usuario(SQLModel, table=True):
    __tablename__ = "usuarios"

    id: int | None = Field(default=None, primary_key=True)
    username: str = Field(unique=True, index=True, max_length=50)
    full_name: str = Field(max_length=100)
    email: str = Field(unique=True, index=True, max_length=150)
    hashed_password: str
    role: str = Field(default="user")  # "user" o "admin"
    disabled: bool = Field(default=False)  # baja logica
    created_at: datetime = Field(default_factory=datetime.now)

    pedidos: list["Pedido"] = Relationship(back_populates="usuario")
