import re
import unicodedata
from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.core.exceptions import NotFoundError
from app.models.category import Category
from app.models.order_item import OrderItem
from app.models.product import Product
from app.models.product_image import ProductImage
from app.models.product_variant import ProductVariant
from app.schemas.product import ProductCreate, ProductUpdate, ProductVariantIn
from app.utils.pagination import PageParams, build_meta


def slugify(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", normalized).strip("-").lower()
    return slug or "produit"


def _unique_slug(db: Session, base_slug: str, *, exclude_id: int | None = None) -> str:
    slug = base_slug
    suffix = 2
    while True:
        query = db.query(Product).filter(Product.slug == slug)
        if exclude_id:
            query = query.filter(Product.id != exclude_id)
        if not db.query(query.exists()).scalar():
            return slug
        slug = f"{base_slug}-{suffix}"
        suffix += 1


def _unique_sku(db: Session, base_sku: str) -> str:
    sku = base_sku
    suffix = 2
    while db.query(db.query(ProductVariant).filter(ProductVariant.sku == sku).exists()).scalar():
        sku = f"{base_sku}-{suffix}"
        suffix += 1
    return sku


def list_products(
    db: Session,
    *,
    category: str | None,
    size: str | None,
    color: str | None,
    min_price: Decimal | None,
    max_price: Decimal | None,
    sort: str | None,
    search: str | None,
    page_params: PageParams,
    include_inactive: bool = False,
) -> tuple[list[Product], dict]:
    query = db.query(Product).join(Category).options(
        selectinload(Product.category),
        selectinload(Product.images),
        selectinload(Product.variants),
    )

    if not include_inactive:
        query = query.filter(Product.is_active.is_(True))
    if category:
        query = query.filter(Category.slug == category)
    if min_price is not None:
        query = query.filter(Product.base_price >= min_price)
    if max_price is not None:
        query = query.filter(Product.base_price <= max_price)
    if search:
        query = query.filter(Product.name.ilike(f"%{search}%"))
    if size or color:
        query = query.join(ProductVariant)
        if size:
            query = query.filter(ProductVariant.size == size)
        if color:
            query = query.filter(ProductVariant.color == color)
        query = query.distinct()

    if sort == "price_asc":
        query = query.order_by(Product.base_price.asc())
    elif sort == "price_desc":
        query = query.order_by(Product.base_price.desc())
    else:
        query = query.order_by(Product.created_at.desc())

    total = query.order_by(None).with_entities(func.count(func.distinct(Product.id))).scalar() or 0
    items = query.offset(page_params.offset).limit(page_params.page_size).all()
    meta = build_meta(page=page_params.page, page_size=page_params.page_size, total=total)
    return items, meta


def get_product(db: Session, product_id: int, *, include_inactive: bool = False) -> Product:
    query = db.query(Product).options(
        selectinload(Product.category),
        selectinload(Product.images),
        selectinload(Product.variants),
    ).filter(Product.id == product_id)
    if not include_inactive:
        query = query.filter(Product.is_active.is_(True))
    product = query.first()
    if product is None:
        raise NotFoundError("Produit introuvable.")
    return product


def get_product_by_id_or_slug(
    db: Session, id_or_slug: str, *, include_inactive: bool = False
) -> Product:
    if id_or_slug.isdigit():
        return get_product(db, int(id_or_slug), include_inactive=include_inactive)

    query = db.query(Product).options(
        selectinload(Product.category),
        selectinload(Product.images),
        selectinload(Product.variants),
    ).filter(Product.slug == id_or_slug)
    if not include_inactive:
        query = query.filter(Product.is_active.is_(True))
    product = query.first()
    if product is None:
        raise NotFoundError("Produit introuvable.")
    return product


def create_product(db: Session, payload: ProductCreate) -> Product:
    category = db.get(Category, payload.category_id)
    if category is None:
        raise NotFoundError("Catégorie introuvable.")

    slug = _unique_slug(db, slugify(payload.name))
    product = Product(
        category_id=payload.category_id,
        name=payload.name,
        slug=slug,
        description=payload.description,
        base_price=payload.base_price,
        is_active=payload.is_active,
    )
    db.add(product)
    db.flush()

    for variant_in in payload.variants:
        _add_variant(db, product, variant_in)

    db.commit()
    db.refresh(product)
    return product


def _add_variant(db: Session, product: Product, variant_in: ProductVariantIn) -> ProductVariant:
    base_sku = variant_in.sku or slugify(f"{product.slug}-{variant_in.color}-{variant_in.size}")
    sku = _unique_sku(db, base_sku)
    variant = ProductVariant(
        product_id=product.id,
        size=variant_in.size,
        color=variant_in.color,
        stock_quantity=variant_in.stock_quantity,
        sku=sku,
    )
    db.add(variant)
    return variant


def update_product(db: Session, product_id: int, payload: ProductUpdate) -> Product:
    product = get_product(db, product_id, include_inactive=True)

    data = payload.model_dump(exclude_unset=True)
    if "category_id" in data and data["category_id"] is not None:
        if db.get(Category, data["category_id"]) is None:
            raise NotFoundError("Catégorie introuvable.")
    if "name" in data and data["name"] and data["name"] != product.name:
        product.slug = _unique_slug(db, slugify(data["name"]), exclude_id=product.id)

    for field, value in data.items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)
    return product


def delete_product(db: Session, product_id: int) -> None:
    product = get_product(db, product_id, include_inactive=True)

    has_orders = (
        db.query(OrderItem)
        .join(ProductVariant, OrderItem.product_variant_id == ProductVariant.id)
        .filter(ProductVariant.product_id == product.id)
        .first()
        is not None
    )

    if has_orders:
        # On garde l'historique de vente intact : désactivation logique.
        product.is_active = False
        db.commit()
        return

    db.delete(product)
    db.commit()


def duplicate_product(db: Session, product_id: int) -> Product:
    original = get_product(db, product_id, include_inactive=True)

    copy = Product(
        category_id=original.category_id,
        name=f"{original.name} (copie)",
        slug=_unique_slug(db, slugify(f"{original.name}-copie")),
        description=original.description,
        base_price=original.base_price,
        is_active=False,
    )
    db.add(copy)
    db.flush()

    for variant in original.variants:
        copy_variant = ProductVariant(
            product_id=copy.id,
            size=variant.size,
            color=variant.color,
            stock_quantity=variant.stock_quantity,
            sku=_unique_sku(db, f"{variant.sku}-copie"),
        )
        db.add(copy_variant)

    for image in original.images:
        db.add(
            ProductImage(
                product_id=copy.id, image_url=image.image_url, display_order=image.display_order
            )
        )

    db.commit()
    db.refresh(copy)
    return copy


def add_product_image(db: Session, product_id: int, image_url: str) -> ProductImage:
    product = get_product(db, product_id, include_inactive=True)
    max_order = db.query(func.max(ProductImage.display_order)).filter(
        ProductImage.product_id == product.id
    ).scalar()
    image = ProductImage(
        product_id=product.id, image_url=image_url, display_order=(max_order or 0) + 1
    )
    db.add(image)
    db.commit()
    db.refresh(image)
    return image
