import datetime
from decimal import Decimal

from pydantic import BaseModel, Field

from app.models.order import OrderStatus, PaymentMethod


class OrderItemIn(BaseModel):
    product_variant_id: int
    quantity: int = Field(gt=0)


class OrderCreate(BaseModel):
    customer_name: str = Field(min_length=2, max_length=150)
    customer_phone: str = Field(min_length=6, max_length=30)
    customer_address: str = Field(min_length=5, max_length=500)
    payment_method: PaymentMethod
    items: list[OrderItemIn] = Field(min_length=1)


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
    customer_address: str
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
