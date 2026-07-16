import datetime
from decimal import Decimal

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.activity_log import ActivityLog
from app.models.order import Order, OrderStatus
from app.models.order_item import OrderItem
from app.models.product import Product
from app.models.product_variant import ProductVariant
from app.models.user import User, UserRole

LOW_STOCK_THRESHOLD = 5
TOP_PRODUCTS_LIMIT = 5


def _revenue_since(db: Session, since: datetime.datetime) -> Decimal:
    total = (
        db.query(func.coalesce(func.sum(Order.total_amount), 0))
        .filter(Order.created_at >= since, Order.status != OrderStatus.cancelled)
        .scalar()
    )
    return Decimal(total or 0)


def _top_products(db: Session, *, limit: int = TOP_PRODUCTS_LIMIT) -> list[dict]:
    rows = (
        db.query(
            Product.id,
            Product.name,
            func.coalesce(func.sum(OrderItem.quantity), 0).label("quantity_sold"),
            func.coalesce(func.sum(OrderItem.subtotal), 0).label("revenue"),
        )
        .join(ProductVariant, ProductVariant.product_id == Product.id)
        .join(OrderItem, OrderItem.product_variant_id == ProductVariant.id)
        .join(Order, Order.id == OrderItem.order_id)
        .filter(Order.status != OrderStatus.cancelled)
        .group_by(Product.id, Product.name)
        .order_by(func.sum(OrderItem.quantity).desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "product_id": r.id,
            "product_name": r.name,
            "quantity_sold": r.quantity_sold,
            "revenue": r.revenue,
        }
        for r in rows
    ]


def _low_stock_variants(db: Session, *, threshold: int = LOW_STOCK_THRESHOLD) -> list[dict]:
    rows = (
        db.query(ProductVariant, Product.name)
        .join(Product, Product.id == ProductVariant.product_id)
        .filter(ProductVariant.stock_quantity <= threshold, Product.is_active.is_(True))
        .order_by(ProductVariant.stock_quantity.asc())
        .limit(20)
        .all()
    )
    return [
        {
            "product_variant_id": variant.id,
            "product_name": name,
            "size": variant.size,
            "color": variant.color,
            "stock_quantity": variant.stock_quantity,
        }
        for variant, name in rows
    ]


def get_owner_stats(db: Session) -> dict:
    now = datetime.datetime.now(datetime.timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - datetime.timedelta(days=today_start.weekday())
    month_start = today_start.replace(day=1)

    pending_orders_count = db.query(Order).filter(Order.status == OrderStatus.pending).count()

    return {
        "revenue_today": _revenue_since(db, today_start),
        "revenue_week": _revenue_since(db, week_start),
        "revenue_month": _revenue_since(db, month_start),
        "pending_orders_count": pending_orders_count,
        "low_stock_variants": _low_stock_variants(db),
        "top_products": _top_products(db),
    }


def get_global_stats(db: Session) -> dict:
    since_24h = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=24)

    total_revenue = (
        db.query(func.coalesce(func.sum(Order.total_amount), 0))
        .filter(Order.status != OrderStatus.cancelled)
        .scalar()
    )
    orders_count = db.query(Order).count()
    owners_count = db.query(User).filter(User.role == UserRole.owner).count()
    recent_failed_logins = (
        db.query(ActivityLog)
        .filter(ActivityLog.action == "auth.login_failed", ActivityLog.created_at >= since_24h)
        .count()
    )

    return {
        "total_revenue": Decimal(total_revenue or 0),
        "orders_count": orders_count,
        "owners_count": owners_count,
        "top_products": _top_products(db),
        "recent_failed_logins": recent_failed_logins,
    }
