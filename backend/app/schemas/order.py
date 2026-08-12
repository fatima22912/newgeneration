import datetime
from decimal import Decimal

from pydantic import BaseModel, Field, model_validator

from app.models.order import FulfillmentMethod, OrderStatus, PaymentMethod


class OrderItemIn(BaseModel):
    product_variant_id: int
    quantity: int = Field(gt=0)


class OrderCreate(BaseModel):
    customer_name: str = Field(min_length=2, max_length=150)
    customer_phone: str = Field(min_length=6, max_length=30)
    customer_address: str | None = Field(default=None, max_length=500)
    fulfillment_method: FulfillmentMethod = FulfillmentMethod.delivery
    payment_method: PaymentMethod
    items: list[OrderItemIn] = Field(min_length=1)

    @model_validator(mode="after")
    def _address_required_for_delivery(self) -> "OrderCreate":
        address_needed = (
            self.fulfillment_method == FulfillmentMethod.delivery
            and self.payment_method != PaymentMethod.cash_on_delivery
        )
        if address_needed and (not self.customer_address or len(self.customer_address.strip()) < 5):
            raise ValueError("L'adresse de livraison est requise (5 caractères minimum).")
        return self


class OrderItemOut(BaseModel):
    id: int
    product_variant_id: int
    product_name: str
    size: str
    color: str
    quantity: int
    unit_price: Decimal
    subtotal: Decimal


class OrderOut(BaseModel):
    id: int
    order_number: str
    customer_name: str
    customer_phone: str
    customer_address: str | None
    fulfillment_method: FulfillmentMethod
    status: OrderStatus
    payment_method: PaymentMethod
    total_amount: Decimal
    items: list[OrderItemOut]
    created_at: datetime.datetime


class OrderListItem(BaseModel):
    id: int
    order_number: str
    customer_name: str
    status: OrderStatus
    payment_method: PaymentMethod
    total_amount: Decimal
    created_at: datetime.datetime

    model_config = {"from_attributes": True}


class OrderTrackRequest(BaseModel):
    order_number: str
    phone: str


class OrderStatusUpdate(BaseModel):
    status: OrderStatus
