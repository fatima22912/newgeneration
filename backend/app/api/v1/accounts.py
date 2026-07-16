from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import require_role
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import (
    OwnerCreateRequest,
    OwnerCreateResponse,
    OwnerOut,
    OwnerUpdateRequest,
)
from app.services import account_service
from app.services.activity_log_service import log_action
from app.utils.pagination import get_page_params

router = APIRouter(prefix="/accounts", tags=["accounts"])


@router.get("/owners")
def list_owners(
    page: int = 1,
    page_size: int | None = None,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("admin")),
) -> dict:
    page_params = get_page_params(page, page_size)
    items, meta = account_service.list_owners(db, page_params=page_params)
    return {"data": [OwnerOut.model_validate(o) for o in items], "meta": meta}


@router.post("/owners", status_code=201, response_model=OwnerCreateResponse)
def create_owner(
    payload: OwnerCreateRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("admin")),
) -> OwnerCreateResponse:
    owner, temporary_password = account_service.create_owner(db, payload, created_by=admin)
    log_action(db, user=admin, action="account.created", entity_type="user", entity_id=owner.id)
    return OwnerCreateResponse(owner=OwnerOut.model_validate(owner), temporary_password=temporary_password)


@router.put("/owners/{owner_id}")
def update_owner(
    owner_id: int,
    payload: OwnerUpdateRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("admin")),
) -> dict:
    owner = account_service.update_owner(db, owner_id, payload)
    log_action(db, user=admin, action="account.updated", entity_type="user", entity_id=owner.id)
    return {"data": OwnerOut.model_validate(owner)}


@router.patch("/owners/{owner_id}/disable")
def disable_owner(
    owner_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("admin")),
) -> dict:
    owner = account_service.set_owner_active(db, owner_id, is_active=False)
    log_action(db, user=admin, action="account.disabled", entity_type="user", entity_id=owner.id)
    return {"data": OwnerOut.model_validate(owner)}


@router.patch("/owners/{owner_id}/enable")
def enable_owner(
    owner_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("admin")),
) -> dict:
    owner = account_service.set_owner_active(db, owner_id, is_active=True)
    log_action(db, user=admin, action="account.enabled", entity_type="user", entity_id=owner.id)
    return {"data": OwnerOut.model_validate(owner)}


@router.patch("/owners/{owner_id}/reset-password", response_model=OwnerCreateResponse)
def reset_owner_password(
    owner_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("admin")),
) -> OwnerCreateResponse:
    owner, temporary_password = account_service.reset_owner_password(db, owner_id)
    log_action(
        db, user=admin, action="account.password_reset", entity_type="user", entity_id=owner.id
    )
    return OwnerCreateResponse(owner=OwnerOut.model_validate(owner), temporary_password=temporary_password)
