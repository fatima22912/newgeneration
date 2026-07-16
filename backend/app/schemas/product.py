from decimal import Decimal

from pydantic import BaseModel, Field

from app.schemas.category import CategoryOut


class ProductVariantIn(BaseModel):
    size: str = Field(min_length=1, max_length=20)
    color: str = Field(min_length=1, max_length=50)
    stock_quantity: int = Field(ge=0, default=0)
    sku: str | None = Field(default=None, max_length=64)


class ProductVariantOut(BaseModel):
    id: int
    size: str
    color: str
    stock_quantity: int
    sku: str

    model_config = {"from_attributes": True}


class ProductImageOut(BaseModel):
    id: int
    image_url: str
    display_order: int

    model_config = {"from_attributes": True}


class ProductCreate(BaseModel):
    category_id: int
    name: str = Field(min_length=2, max_length=200)
    description: str | None = None
    base_price: Decimal = Field(gt=0)
    is_active: bool = True
    variants: list[ProductVariantIn] = Field(default_factory=list)


class ProductUpdate(BaseModel):
    category_id: int | None = None
    name: str | None = Field(default=None, min_length=2, max_length=200)
    description: str | None = None
    base_price: Decimal | None = Field(default=None, gt=0)
    is_active: bool | None = None


class ProductListItem(BaseModel):
    id: int
    name: str
    slug: str
    base_price: Decimal
    is_active: bool
    category: CategoryOut
    main_image_url: str | None = None
    total_stock: int = 0

    model_config = {"from_attributes": True}


class ProductOut(BaseModel):
    id: int
    name: str
    slug: str
    description: str | None = None
    base_price: Decimal
    is_active: bool
    category: CategoryOut
    variants: list[ProductVariantOut]
    images: list[ProductImageOut]

    model_config = {"from_attributes": True}
