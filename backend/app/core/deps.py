from collections.abc import Callable

from fastapi import Depends, HTTPException, Request, status
from sqlmodel import Session

from app.core.database import get_session
from app.core.security import decode_access_token
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.repository import UsuarioRepository

COOKIE_NAME = "access_token"


def get_current_user(request: Request, session: Session = Depends(get_session)) -> Usuario:
    """Lee el token de la cookie HttpOnly, lo valida y devuelve el usuario."""
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No autenticado")

    payload = decode_access_token(token)
    if payload is None or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido o expirado"
        )

    usuario = UsuarioRepository(session).get_by_username(str(payload["sub"]))
    if usuario is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario no encontrado")
    return usuario


def get_current_active_user(usuario: Usuario = Depends(get_current_user)) -> Usuario:
    if usuario.disabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Cuenta de usuario desactivada"
        )
    return usuario


def require_role(roles: list[str]) -> Callable[[Usuario], Usuario]:
    """Devuelve una dependencia que verifica que el usuario tenga alguno de los roles."""

    def verificar_rol(usuario: Usuario = Depends(get_current_active_user)) -> Usuario:
        if usuario.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tenés permisos para realizar esta acción",
            )
        return usuario

    return verificar_rol
