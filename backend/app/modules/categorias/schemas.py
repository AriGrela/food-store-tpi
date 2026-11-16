from sqlmodel import Field, SQLModel


class CategoriaCreate(SQLModel):
    nombre: str = Field(min_length=2, max_length=100)
    descripcion: str | None = Field(default=None, max_length=255)


class CategoriaUpdate(SQLModel):
    # todo opcional: el PUT actualiza solo lo que se manda
    nombre: str | None = Field(default=None, min_length=2, max_length=100)
    descripcion: str | None = Field(default=None, max_length=255)


class CategoriaRead(SQLModel):
    id: int
    nombre: str
    descripcion: str | None
    activo: bool
