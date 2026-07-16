from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.core.rate_limit import limiter
from app.db.session import get_db
from app.models.contact_message import ContactMessage
from app.schemas.contact import ContactCreate, ContactOut

router = APIRouter(prefix="/contact", tags=["contact"])


@router.post("", status_code=201)
@limiter.limit("5/minute")
def submit_contact_message(
    request: Request, payload: ContactCreate, db: Session = Depends(get_db)
) -> dict:
    message = ContactMessage(
        name=payload.name, email=payload.email, subject=payload.subject, message=payload.message
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    return {"data": ContactOut.model_validate(message)}
