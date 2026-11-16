from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


# ---- Excepciones de dominio ----
class UsuarioNoEncontrado(Exception):
    pass


class AutoDesactivacion(Exception):
    """El admin no se puede desactivar a si mismo."""


class UsuarioService:
    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def listar(self) -> list[UserPublic]:
        with self.uow as uow:
            return [UserPublic.model_validate(u) for u in uow.usuarios.listar()]

    def activar(self, usuario_id: int) -> UserPublic:
        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(usuario_id)
            if usuario is None:
                raise UsuarioNoEncontrado()
            # es idempotente: si ya estaba activo no pasa nada
            usuario.disabled = False
            uow.session.add(usuario)
            return UserPublic.model_validate(usuario)

    def desactivar(self, usuario_id: int, admin_id: int) -> UserPublic:
        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(usuario_id)
            if usuario is None:
                raise UsuarioNoEncontrado()
            if usuario.id == admin_id:
                raise AutoDesactivacion()
            usuario.disabled = True
            uow.session.add(usuario)
            return UserPublic.model_validate(usuario)
