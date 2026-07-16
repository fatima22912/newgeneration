import jwt
from fastapi import APIRouter, Depends, Request, Response
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.dependencies import get_current_user
from app.core.exceptions import UnauthorizedError
from app.core.rate_limit import limiter
from app.core.security import decode_token
from app.db.session import get_db
from app.models.user import User, UserRole
from app.schemas.auth import ChangePasswordRequest, LoginRequest, TokenResponse
from app.schemas.user import UserPublicOut
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])
settings = get_settings()


def _set_refresh_cookie(response: Response, refresh_token: str) -> None:
    response.set_cookie(
        key=settings.refresh_cookie_name,
        value=refresh_token,
        httponly=True,
        secure=settings.refresh_cookie_secure,
        samesite="lax",
        max_age=settings.refresh_token_expire_days * 24 * 60 * 60,
        path="/api/v1/auth",
    )


def _login(db: Session, response: Response, payload: LoginRequest, role: UserRole) -> TokenResponse:
    user = auth_service.authenticate(
        db, email=payload.email, password=payload.password, expected_role=role
    )
    access_token, refresh_token = auth_service.issue_tokens(user)
    _set_refresh_cookie(response, refresh_token)
    return TokenResponse(
        access_token=access_token,
        expires_in_minutes=settings.access_token_expire_minutes,
        user=UserPublicOut.model_validate(user),
    )


@router.post("/owner/login", response_model=TokenResponse)
@limiter.limit("10/minute")
def owner_login(
    request: Request, response: Response, payload: LoginRequest, db: Session = Depends(get_db)
) -> TokenResponse:
    return _login(db, response, payload, UserRole.owner)


@router.post("/admin/login", response_model=TokenResponse)
@limiter.limit("10/minute")
def admin_login(
    request: Request, response: Response, payload: LoginRequest, db: Session = Depends(get_db)
) -> TokenResponse:
    return _login(db, response, payload, UserRole.admin)


@router.post("/refresh", response_model=TokenResponse)
def refresh(request: Request, response: Response, db: Session = Depends(get_db)) -> TokenResponse:
    raw_token = request.cookies.get(settings.refresh_cookie_name)
    if not raw_token:
        raise UnauthorizedError("Aucune session à rafraîchir.")

    try:
        payload = decode_token(raw_token)
    except jwt.PyJWTError as exc:
        raise UnauthorizedError("Session expirée, merci de vous reconnecter.") from exc

    if payload.get("type") != "refresh":
        raise UnauthorizedError("Token invalide pour cette opération.")

    user = db.get(User, int(payload["sub"]))
    if user is None or not user.is_active:
        raise UnauthorizedError("Compte introuvable ou désactivé.")

    access_token, new_refresh_token = auth_service.issue_tokens(user)
    _set_refresh_cookie(response, new_refresh_token)
    return TokenResponse(
        access_token=access_token,
        expires_in_minutes=settings.access_token_expire_minutes,
        user=UserPublicOut.model_validate(user),
    )


@router.post("/logout")
def logout(response: Response) -> dict:
    response.delete_cookie(settings.refresh_cookie_name, path="/api/v1/auth")
    return {"data": {"message": "Déconnexion réussie."}}


@router.post("/change-password")
def change_password(
    payload: ChangePasswordRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict:
    auth_service.change_password(
        db, user=user, current_password=payload.current_password, new_password=payload.new_password
    )
    return {"data": {"message": "Mot de passe mis à jour."}}
