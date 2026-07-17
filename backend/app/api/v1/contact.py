from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.core.dependencies import require_role
from app.core.rate_limit import limiter
from app.db.session import get_db
from app.models.user import User
from app.schemas.contact import ContactCreate, ContactOut
from app.services import contact_service
from app.utils.pagination import get_page_params

router = APIRouter(prefix="/contact", tags=["contact"])


@router.post("", status_code=201)
@limiter.limit("5/minute")
def submit_contact_message(request: Request, payload: ContactCreate, db: Session = Depends(get_db)) -> dict:
    message = contact_service.create_message(
        db, name=payload.name, email=payload.email, subject=payload.subject, message=payload.message
    )
    return {"data": ContactOut.model_validate(message)}


@router.get("")
def list_contact_messages(
    page: int = 1,
    page_size: int | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("owner", "admin")),
) -> dict:
    page_params = get_page_params(page, page_size)
    items, meta = contact_service.list_messages(db, page_params=page_params)
    return {"data": [ContactOut.model_validate(m) for m in items], "meta": meta}


@router.get("/{message_id}")
def get_contact_message(
    message_id: int, db: Session = Depends(get_db), user: User = Depends(require_role("owner", "admin"))
) -> dict:
    message = contact_service.get_message(db, message_id)
    return {"data": ContactOut.model_validate(message)}


@router.patch("/{message_id}/read")
def mark_contact_message_read(
    message_id: int, db: Session = Depends(get_db), user: User = Depends(require_role("owner", "admin"))
) -> dict:
    message = contact_service.mark_as_read(db, message_id)
    return {"data": ContactOut.model_validate(message)}
