import datetime

from sqlalchemy import DateTime, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class AdminRecoveryUse(Base):
    """Records consumed recovery tokens so a reset token can only work once."""

    __tablename__ = "admin_recovery_uses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    token_fingerprint: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    used_at: Mapped[datetime.datetime] = mapped_column(DateTime, server_default=func.now())
