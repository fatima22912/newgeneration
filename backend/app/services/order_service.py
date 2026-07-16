from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from app.core.exceptions import ConflictError, InsufficientStockError, NotFoundError
from app.models.order import Order, OrderStatus
from app.models.order_item import OrderItem
from app.models.order_status_history import OrderStatusHistory
from app.models.product_variant import ProductVariant
from app.models.user import User
from app.schemas.order import OrderCreate, OrderStatusUpdate
from app.utils.order_number_generator import generate_order_number
from app.utils.pagination import PageParams, build_meta

_MAX_ORDER_NUMBER_RETRIES = 3


def _load(query):
    return query.options(
        selectinload(Order.items).selectinload(OrderItem.product_variant).selectinload(
            ProductVariant.product
        )
    )


def create_order(db: Session, payload: OrderCreate) -> Order:
    """Décrémente le stock et crée la commande dans une seule transaction,
    avec verrouillage de ligne pour éviter la survente en cas de commandes
    simultanées sur la même variante.
    """
    for attempt in range(_MAX_ORDER_NUMBER_RETRIES):
        try:
            with db.begin_nested():
                total_amount = 0
                order_items: list[OrderItem] = []

                for item_in in payload.items:
                    variant = (
                        db.query(ProductVariant)
                        .filter(ProductVariant.id == item_in.product_variant_id)
                        .with_for_update()
                        .first()
                    )
                    if variant is None:
                        raise NotFoundError(
                            f"Variante produit {item_in.product_variant_id} introuvable."
                        )
                    if variant.stock_quantity < item_in.quantity:
                        raise InsufficientStockError(
                            f"Stock insuffisant pour {variant.product.name} "
                            f"({variant.color}, {variant.size})."
                        )

                    variant.stock_quantity -= item_in.quantity
                    unit_price = variant.product.base_price
                    subtotal = unit_price * item_in.quantity
                    total_amount += subtotal

                    order_items.append(
                        OrderItem(
                            product_variant_id=variant.id,
                            quantity=item_in.quantity,
                            unit_price=unit_price,
                            subtotal=subtotal,
                        )
                    )

                order = Order(
                    order_number=generate_order_number(db),
                    customer_name=payload.customer_name,
                    customer_phone=payload.customer_phone,
                    customer_address=payload.customer_address,
                    status=OrderStatus.pending,
                    payment_method=payload.payment_method,
                    total_amount=total_amount,
                    items=order_items,
                )
                db.add(order)
                db.flush()

                db.add(
                    OrderStatusHistory(
                        order_id=order.id, old_status=None, new_status=OrderStatus.pending
                    )
                )

            db.commit()
            db.refresh(order)
            return order

        except IntegrityError:
            db.rollback()
            if attempt == _MAX_ORDER_NUMBER_RETRIES - 1:
                raise
            continue


def get_order(db: Session, order_id: int) -> Order:
    order = _load(db.query(Order)).filter(Order.id == order_id).first()
    if order is None:
        raise NotFoundError("Commande introuvable.")
    return order


def track_order(db: Session, *, order_number: str, phone: str) -> Order:
    order = (
        _load(db.query(Order))
        .filter(Order.order_number == order_number, Order.customer_phone == phone)
        .first()
    )
    if order is None:
        raise NotFoundError("Aucune commande ne correspond à ces informations.")
    return order


def list_orders(
    db: Session,
    *,
    status: OrderStatus | None,
    date_from,
    date_to,
    page_params: PageParams,
) -> tuple[list[Order], dict]:
    query = db.query(Order)
    if status:
        query = query.filter(Order.status == status)
    if date_from:
        query = query.filter(Order.created_at >= date_from)
    if date_to:
        query = query.filter(Order.created_at <= date_to)

    total = query.count()
    items = (
        query.order_by(Order.created_at.desc())
        .offset(page_params.offset)
        .limit(page_params.page_size)
        .all()
    )
    meta = build_meta(page=page_params.page, page_size=page_params.page_size, total=total)
    return items, meta


_ALLOWED_TRANSITIONS: dict[OrderStatus, set[OrderStatus]] = {
    OrderStatus.pending: {OrderStatus.processing, OrderStatus.cancelled},
    OrderStatus.processing: {OrderStatus.shipped, OrderStatus.cancelled},
    OrderStatus.shipped: {OrderStatus.delivered},
    OrderStatus.delivered: set(),
    OrderStatus.cancelled: set(),
}


def update_order_status(
    db: Session, order_id: int, payload: OrderStatusUpdate, *, changed_by: User
) -> Order:
    order = get_order(db, order_id)

    if payload.status != order.status and payload.status not in _ALLOWED_TRANSITIONS[order.status]:
        raise ConflictError(
            f"Transition de statut invalide : {order.status.value} → {payload.status.value}."
        )

    old_status = order.status
    order.status = payload.status
    db.add(
        OrderStatusHistory(
            order_id=order.id,
            old_status=old_status,
            new_status=payload.status,
            changed_by=changed_by.id,
        )
    )
    db.commit()
    db.refresh(order)
    return order
