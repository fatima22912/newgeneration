from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import require_role
from app.db.session import get_db
from app.models.user import User
from app.services.activity_log_service import list_activity_log
from app.utils.pagination import get_page_params

router = APIRouter(prefix="/activity-log", tags=["activity-log"])


@router.get("")
def get_activity_log(
    page: int = 1,
    page_size: int | None = None,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("admin")),
) -> dict:
    page_params = get_page_params(page, page_size)
    entries, meta = list_activity_log(db, page_params=page_params)
    data = [
        {
            "id": e.id,
            "user_id": e.user_id,
            "action": e.action,
            "entity_type": e.entity_type,
            "entity_id": e.entity_id,
            "ip_address": e.ip_address,
            "created_at": e.created_at,
        }
        for e in entries
    ]
    return {"data": data, "meta": meta}
