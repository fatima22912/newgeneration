from decimal import Decimal

from pydantic import BaseModel


class LowStockVariant(BaseModel):
    product_variant_id: int
    product_name: str
    size: str
    color: str
    stock_quantity: int


class TopProduct(BaseModel):
    product_id: int
    product_name: str
    quantity_sold: int
    revenue: Decimal


class OwnerStatsOut(BaseModel):
    revenue_today: Decimal
    revenue_week: Decimal
    revenue_month: Decimal
    pending_orders_count: int
    low_stock_variants: list[LowStockVariant]
    top_products: list[TopProduct]


class GlobalStatsOut(BaseModel):
    total_revenue: Decimal
    orders_count: int
    owners_count: int
    top_products: list[TopProduct]
    recent_failed_logins: int
