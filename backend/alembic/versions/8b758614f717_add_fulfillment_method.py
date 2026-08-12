"""add fulfillment method to orders

Revision ID: 8b758614f717
Revises: ea843ce4b670
Create Date: 2026-08-12 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8b758614f717'
down_revision: Union[str, None] = 'ea843ce4b670'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    fulfillment_method_enum = sa.Enum('delivery', 'pickup', name='fulfillmentmethod')
    fulfillment_method_enum.create(op.get_bind())
    op.add_column(
        'orders',
        sa.Column(
            'fulfillment_method',
            fulfillment_method_enum,
            nullable=False,
            server_default='delivery',
        ),
    )
    op.alter_column('orders', 'customer_address', existing_type=sa.String(length=500), nullable=True)


def downgrade() -> None:
    op.alter_column('orders', 'customer_address', existing_type=sa.String(length=500), nullable=False)
    op.drop_column('orders', 'fulfillment_method')
    sa.Enum(name='fulfillmentmethod').drop(op.get_bind())
