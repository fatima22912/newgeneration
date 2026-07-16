import datetime

from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.exceptions import AccountLockedError, UnauthorizedError
from app.core.security import (
    create_access_token,
    create_refresh_token,
    hash_password,
    verify_password,
)
from app.models.user import User, UserRole
from app.services.activity_log_service import log_action

settings = get_settings()


def authenticate(db: Session, *, email: str, password: str, expected_role: UserRole) -> User:
    user = db.query(User).filter(User.email == email, User.role == expected_role).first()

    generic_error = "Identifiants incorrects."

    if user is None:
        raise UnauthorizedError(generic_error)

    now = datetime.datetime.now(datetime.timezone.utc)
    locked_until = user.locked_until
    if locked_until is not None:
        if locked_until.tzinfo is None:
            locked_until = locked_until.replace(tzinfo=datetime.timezone.utc)
        if locked_until > now:
            raise AccountLockedError(
                "Compte temporairement verrouillé suite à trop de tentatives échouées. "
                "Réessayez plus tard."
            )

    if not user.is_active:
        raise UnauthorizedError("Ce compte a été désactivé.")

    if not verify_password(password, user.password_hash):
        user.failed_login_attempts += 1
        if user.failed_login_attempts >= settings.max_failed_login_attempts:
            user.locked_until = now + datetime.timedelta(minutes=settings.account_lock_minutes)
        db.commit()
        log_action(
            db,
            user=None,
            action="auth.login_failed",
            entity_type="user",
            entity_id=user.id,
        )
        raise UnauthorizedError(generic_error)

    user.failed_login_attempts = 0
    user.locked_until = None
    db.commit()
    log_action(db, user=user, action="auth.login_success", entity_type="user", entity_id=user.id)

    return user


def issue_tokens(user: User) -> tuple[str, str]:
    access_token = create_access_token(subject=user.id, role=user.role.value)
    refresh_token = create_refresh_token(subject=user.id, role=user.role.value)
    return access_token, refresh_token


def change_password(db: Session, *, user: User, current_password: str, new_password: str) -> None:
    if not verify_password(current_password, user.password_hash):
        raise UnauthorizedError("Mot de passe actuel incorrect.")
    user.password_hash = hash_password(new_password)
    db.commit()
    log_action(db, user=user, action="auth.password_changed", entity_type="user", entity_id=user.id)
