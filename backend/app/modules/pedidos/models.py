from datetime import datetime
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.productos.models import Producto
    from app.modules.usuarios.models import Usuario


class Pedido(SQLModel, table=True):
    __tablename__ = "pedidos"

    id: int | None = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuarios.id", index=True)
    estado: str = Field(default="PENDIENTE", index=True)
    forma_pago: str  # EFECTIVO o TRANSFERENCIA
    direccion_entrega: str = Field(max_length=200)
    notas: str | None = Field(default=None, max_length=500)
    total: float = Field(default=0)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    usuario: "Usuario" = Relationship(back_populates="pedidos")
    items: list["DetallePedido"] = Relationship(back_populates="pedido")


class DetallePedido(SQLModel, table=True):
    """Linea del pedido. Guarda una copia del nombre y del precio (no cambia nunca)."""

    __tablename__ = "detalles_pedido"

    id: int | None = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedidos.id", index=True)
    producto_id: int = Field(foreign_key="productos.id")
    cantidad: int = Field(ge=1)
    nombre_producto: str
    precio_unitario: float
    subtotal: float

    pedido: Pedido = Relationship(back_populates="items")
    producto: "Producto" = Relationship(back_populates="detalles")
