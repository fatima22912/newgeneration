import json

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.activity_log import ActivityLog
from app.models.user import User
from app.utils.pagination import PageParams, build_meta


def log_action(
    db: Session,
    *,
    user: User | None,
    action: str,
    entity_type: str,
    entity_id: int | None = None,
    details: dict | None = None,
    ip_address: str | None = None,
) -> None:
    """Journalise une action sensible. Ne doit jamais recevoir de mot de
    passe, même hashé, dans `details`."""
    entry = ActivityLog(
        user_id=user.id if user else None,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        details=json.dumps(details, default=str) if details else None,
        ip_address=ip_address,
    )
    db.add(entry)
    db.commit()


def list_activity_log(db: Session, *, page_params: PageParams) -> tuple[list[ActivityLog], dict]:
    total = db.scalar(select(func.count()).select_from(ActivityLog)) or 0
    entries = (
        db.query(ActivityLog)
        .order_by(ActivityLog.created_at.desc())
        .offset(page_params.offset)
        .limit(page_params.page_size)
        .all()
    )
    meta = build_meta(page=page_params.page, page_size=page_params.page_size, total=total)
    return entries, meta
