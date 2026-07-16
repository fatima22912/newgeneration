from decimal import Decimal

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_optional_user, require_role
from app.db.session import get_db
from app.models.user import User, UserRole
from app.schemas.product import ProductCreate, ProductOut, ProductUpdate
from app.services import product_service
from app.services.activity_log_service import log_action
from app.utils.pagination import get_page_params

router = APIRouter(prefix="/products", tags=["products"])


def _is_privileged(user: User | None) -> bool:
    return user is not None and user.role in (UserRole.owner, UserRole.admin)


@router.get("")
def list_products(
    category: str | None = None,
    size: str | None = None,
    color: str | None = None,
    min_price: Decimal | None = None,
    max_price: Decimal | None = None,
    sort: str | None = None,
    search: str | None = None,
    page: int = 1,
    page_size: int | None = None,
    include_inactive: bool = False,
    db: Session = Depends(get_db),
    user: User | None = Depends(get_optional_user),
) -> dict:
    page_params = get_page_params(page, page_size)
    items, meta = product_service.list_products(
        db,
        category=category,
        size=size,
        color=color,
        min_price=min_price,
        max_price=max_price,
        sort=sort,
        search=search,
        page_params=page_params,
        include_inactive=include_inactive and _is_privileged(user),
    )
    return {"data": [ProductOut.model_validate(p) for p in items], "meta": meta}


@router.get("/{id_or_slug}")
def get_product(
    id_or_slug: str,
    db: Session = Depends(get_db),
    user: User | None = Depends(get_optional_user),
) -> dict:
    # Accepte un ID numérique ou un slug : le catalogue public utilise des
    # URLs à base de slug (/produits/mon-produit) pour des liens lisibles,
    # tandis que le contrat d'origine (section 8) ne nommait qu'un {id}.
    product = product_service.get_product_by_id_or_slug(
        db, id_or_slug, include_inactive=_is_privileged(user)
    )
    return {"data": ProductOut.model_validate(product)}


@router.post("", status_code=201)
def create_product(
    payload: ProductCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("owner", "admin")),
) -> dict:
    product = product_service.create_product(db, payload)
    log_action(db, user=user, action="product.created", entity_type="product", entity_id=product.id)
    return {"data": ProductOut.model_validate(product)}


@router.put("/{product_id}")
def update_product(
    product_id: int,
    payload: ProductUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("owner", "admin")),
) -> dict:
    product = product_service.update_product(db, product_id, payload)
    log_action(db, user=user, action="product.updated", entity_type="product", entity_id=product.id)
    return {"data": ProductOut.model_validate(product)}


@router.delete("/{product_id}", status_code=204)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("owner", "admin")),
) -> None:
    product_service.delete_product(db, product_id)
    log_action(db, user=user, action="product.deleted", entity_type="product", entity_id=product_id)


@router.post("/{product_id}/duplicate", status_code=201)
def duplicate_product(
    product_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("owner", "admin")),
) -> dict:
    copy = product_service.duplicate_product(db, product_id)
    log_action(db, user=user, action="product.duplicated", entity_type="product", entity_id=copy.id)
    return {"data": ProductOut.model_validate(copy)}
