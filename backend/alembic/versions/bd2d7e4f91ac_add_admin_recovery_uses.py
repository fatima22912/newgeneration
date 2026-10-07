"""add one-time admin recovery token tracking

Revision ID: bd2d7e4f91ac
Revises: 8b758614f717
Create Date: 2026-10-07 00:00:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "bd2d7e4f91ac"
down_revision: Union[str, None] = "8b758614f717"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "admin_recovery_uses",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("token_fingerprint", sa.String(length=64), nullable=False),
        sa.Column("used_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("token_fingerprint"),
    )


def downgrade() -> None:
    op.drop_table("admin_recovery_uses")
