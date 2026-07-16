from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import require_role
from app.db.session import get_db
from app.models.user import User
from app.schemas.stats import GlobalStatsOut, OwnerStatsOut
from app.services import stats_service

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("/owner")
def owner_stats(
    db: Session = Depends(get_db), user: User = Depends(require_role("owner", "admin"))
) -> dict:
    return {"data": OwnerStatsOut(**stats_service.get_owner_stats(db))}


@router.get("/global")
def global_stats(db: Session = Depends(get_db), admin: User = Depends(require_role("admin"))) -> dict:
    return {"data": GlobalStatsOut(**stats_service.get_global_stats(db))}
