from app.modules.categorias.models import Categoria
from app.modules.categorias.repository import CategoriaRepository
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


# ---- Excepciones de dominio ----
class CategoriaNoEncontrada(Exception):
    pass


class NombreDuplicado(Exception):
    pass


class CategoriaService:
    def __init__(self, uow: CategoriaUnitOfWork) -> None:
        self.uow = uow

    @staticmethod
    def _obtener_activa(repo: CategoriaRepository, categoria_id: int) -> Categoria:
        """Una categoria dada de baja se trata como si no existiera."""
        categoria = repo.get_by_id(categoria_id)
        if categoria is None or not categoria.activo:
            raise CategoriaNoEncontrada()
        return categoria

    def listar(self) -> list[CategoriaRead]:
        with self.uow as uow:
            return [CategoriaRead.model_validate(c) for c in uow.categorias.listar_activas()]

    def obtener(self, categoria_id: int) -> CategoriaRead:
        with self.uow as uow:
            categoria = self._obtener_activa(uow.categorias, categoria_id)
            return CategoriaRead.model_validate(categoria)

    def crear(self, data: CategoriaCreate) -> CategoriaRead:
        with self.uow as uow:
            if uow.categorias.get_by_nombre(data.nombre) is not None:
                raise NombreDuplicado()
            categoria = Categoria(nombre=data.nombre.strip(), descripcion=data.descripcion)
            uow.categorias.add(categoria)
            return CategoriaRead.model_validate(categoria)

    def actualizar(self, categoria_id: int, data: CategoriaUpdate) -> CategoriaRead:
        with self.uow as uow:
            categoria = self._obtener_activa(uow.categorias, categoria_id)
            cambios = data.model_dump(exclude_unset=True)

            if "nombre" in cambios and cambios["nombre"] is not None:
                otra = uow.categorias.get_by_nombre(cambios["nombre"])
                if otra is not None and otra.id != categoria.id:
                    raise NombreDuplicado()
                cambios["nombre"] = cambios["nombre"].strip()
            elif "nombre" in cambios:
                # nombre es obligatorio, si mandan null lo ignoro
                cambios.pop("nombre")

            categoria.sqlmodel_update(cambios)
            uow.session.add(categoria)
            return CategoriaRead.model_validate(categoria)

    def eliminar(self, categoria_id: int) -> None:
        with self.uow as uow:
            categoria = self._obtener_activa(uow.categorias, categoria_id)
            categoria.activo = False  # baja logica
            uow.session.add(categoria)
