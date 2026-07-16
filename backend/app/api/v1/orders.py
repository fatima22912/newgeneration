import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import require_role
from app.db.session import get_db
from app.models.order import OrderStatus
from app.models.user import User
from app.schemas.order import OrderCreate, OrderOut, OrderStatusUpdate
from app.services import order_service
from app.services.activity_log_service import log_action
from app.utils.pagination import get_page_params

router = APIRouter(prefix="/orders", tags=["orders"])


def _to_order_out(order) -> OrderOut:
    return OrderOut(
        id=order.id,
        order_number=order.order_number,
        customer_name=order.customer_name,
        customer_phone=order.customer_phone,
        customer_address=order.customer_address,
        status=order.status,
        payment_method=order.payment_method,
        total_amount=order.total_amount,
        created_at=order.created_at,
        items=[
            {
                "id": item.id,
                "product_variant_id": item.product_variant_id,
                "product_name": item.product_variant.product.name,
                "size": item.product_variant.size,
                "color": item.product_variant.color,
                "quantity": item.quantity,
                "unit_price": item.unit_price,
                "subtotal": item.subtotal,
            }
            for item in order.items
        ],
    )


@router.post("", status_code=201)
def create_order(payload: OrderCreate, db: Session = Depends(get_db)) -> dict:
    order = order_service.create_order(db, payload)
    return {"data": _to_order_out(order)}


@router.get("/track")
def track_order(order_number: str, phone: str, db: Session = Depends(get_db)) -> dict:
    order = order_service.track_order(db, order_number=order_number, phone=phone)
    return {"data": _to_order_out(order)}


@router.get("")
def list_orders(
    status: OrderStatus | None = None,
    date_from: datetime.datetime | None = None,
    date_to: datetime.datetime | None = None,
    page: int = 1,
    page_size: int | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("owner", "admin")),
) -> dict:
    page_params = get_page_params(page, page_size)
    items, meta = order_service.list_orders(
        db, status=status, date_from=date_from, date_to=date_to, page_params=page_params
    )
    return {"data": [_to_order_out(o) for o in items], "meta": meta}


@router.get("/{order_id}")
def get_order(
    order_id: int, db: Session = Depends(get_db), user: User = Depends(require_role("owner", "admin"))
) -> dict:
    order = order_service.get_order(db, order_id)
    return {"data": _to_order_out(order)}


@router.patch("/{order_id}/status")
def update_order_status(
    order_id: int,
    payload: OrderStatusUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("owner", "admin")),
) -> dict:
    order = order_service.update_order_status(db, order_id, payload, changed_by=user)
    log_action(
        db,
        user=user,
        action="order.status_updated",
        entity_type="order",
        entity_id=order.id,
        details={"new_status": order.status.value},
    )
    return {"data": _to_order_out(order)}
