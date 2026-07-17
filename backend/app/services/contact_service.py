from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.models.contact_message import ContactMessage
from app.utils.pagination import PageParams, build_meta


def create_message(db: Session, *, name: str, email: str, subject: str, message: str) -> ContactMessage:
    contact_message = ContactMessage(name=name, email=email, subject=subject, message=message)
    db.add(contact_message)
    db.commit()
    db.refresh(contact_message)
    return contact_message


def list_messages(db: Session, *, page_params: PageParams) -> tuple[list[ContactMessage], dict]:
    query = db.query(ContactMessage)
    total = query.count()
    items = (
        query.order_by(ContactMessage.created_at.desc())
        .offset(page_params.offset)
        .limit(page_params.page_size)
        .all()
    )
    meta = build_meta(page=page_params.page, page_size=page_params.page_size, total=total)
    return items, meta


def get_message(db: Session, message_id: int) -> ContactMessage:
    contact_message = db.get(ContactMessage, message_id)
    if contact_message is None:
        raise NotFoundError("Message introuvable.")
    return contact_message


def mark_as_read(db: Session, message_id: int) -> ContactMessage:
    contact_message = get_message(db, message_id)
    contact_message.is_read = True
    db.commit()
    db.refresh(contact_message)
    return contact_message
