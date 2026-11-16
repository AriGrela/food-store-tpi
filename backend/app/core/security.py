from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    return pwd_context.verify(password, hashed_password)


def create_access_token(subject: str, expires_minutes: int | None = None) -> str:
    minutos = expires_minutes if expires_minutes is not None else settings.ACCESS_TOKEN_EXPIRE_MINUTES
    expira = datetime.now(timezone.utc) + timedelta(minutes=minutos)
    payload = {"sub": subject, "exp": expira}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> dict[str, Any] | None:
    """Devuelve el payload si el token es valido, o None si la firma esta mal o vencio."""
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        return None
