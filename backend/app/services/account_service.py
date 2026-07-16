from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, NotFoundError
from app.core.security import generate_temporary_password, hash_password
from app.models.user import User, UserRole
from app.schemas.user import OwnerCreateRequest, OwnerUpdateRequest
from app.utils.pagination import PageParams, build_meta


def list_owners(db: Session, *, page_params: PageParams) -> tuple[list[User], dict]:
    query = db.query(User).filter(User.role == UserRole.owner)
    total = query.count()
    items = (
        query.order_by(User.created_at.desc())
        .offset(page_params.offset)
        .limit(page_params.page_size)
        .all()
    )
    meta = build_meta(page=page_params.page, page_size=page_params.page_size, total=total)
    return items, meta


def _get_owner(db: Session, owner_id: int) -> User:
    owner = db.query(User).filter(User.id == owner_id, User.role == UserRole.owner).first()
    if owner is None:
        raise NotFoundError("Compte propriétaire introuvable.")
    return owner


def create_owner(db: Session, payload: OwnerCreateRequest, *, created_by: User) -> tuple[User, str]:
    if db.query(User).filter(User.email == payload.email).first() is not None:
        raise ConflictError("Un compte existe déjà avec cet email.")

    temporary_password = generate_temporary_password()
    owner = User(
        role=UserRole.owner,
        full_name=payload.full_name,
        email=payload.email,
        phone=payload.phone,
        password_hash=hash_password(temporary_password),
        is_active=True,
        created_by=created_by.id,
    )
    db.add(owner)
    db.commit()
    db.refresh(owner)
    return owner, temporary_password


def update_owner(db: Session, owner_id: int, payload: OwnerUpdateRequest) -> User:
    owner = _get_owner(db, owner_id)
    data = payload.model_dump(exclude_unset=True)

    if "email" in data and data["email"] and data["email"] != owner.email:
        if db.query(User).filter(User.email == data["email"]).first() is not None:
            raise ConflictError("Un compte existe déjà avec cet email.")

    for field, value in data.items():
        setattr(owner, field, value)

    db.commit()
    db.refresh(owner)
    return owner


def set_owner_active(db: Session, owner_id: int, *, is_active: bool) -> User:
    owner = _get_owner(db, owner_id)
    owner.is_active = is_active
    db.commit()
    db.refresh(owner)
    return owner


def reset_owner_password(db: Session, owner_id: int) -> tuple[User, str]:
    owner = _get_owner(db, owner_id)
    temporary_password = generate_temporary_password()
    owner.password_hash = hash_password(temporary_password)
    owner.failed_login_attempts = 0
    owner.locked_until = None
    db.commit()
    db.refresh(owner)
    return owner, temporary_password
