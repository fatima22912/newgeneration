from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import require_role
from app.core.exceptions import ConflictError, NotFoundError
from app.db.session import get_db
from app.models.category import Category
from app.models.user import User
from app.schemas.category import CategoryCreate, CategoryOut, CategoryUpdate
from app.services.activity_log_service import log_action
from app.services.product_service import slugify

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("")
def list_categories(db: Session = Depends(get_db)) -> dict:
    categories = db.query(Category).order_by(Category.name.asc()).all()
    return {"data": [CategoryOut.model_validate(c) for c in categories]}


@router.post("", status_code=201)
def create_category(
    payload: CategoryCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("owner", "admin")),
) -> dict:
    if db.query(Category).filter(Category.name == payload.name).first() is not None:
        raise ConflictError("Une catégorie porte déjà ce nom.")

    category = Category(name=payload.name, slug=slugify(payload.name), description=payload.description)
    db.add(category)
    db.commit()
    db.refresh(category)
    log_action(db, user=user, action="category.created", entity_type="category", entity_id=category.id)
    return {"data": CategoryOut.model_validate(category)}


@router.put("/{category_id}")
def update_category(
    category_id: int,
    payload: CategoryUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("owner", "admin")),
) -> dict:
    category = db.get(Category, category_id)
    if category is None:
        raise NotFoundError("Catégorie introuvable.")

    data = payload.model_dump(exclude_unset=True)
    if "name" in data and data["name"]:
        category.name = data["name"]
        category.slug = slugify(data["name"])
    if "description" in data:
        category.description = data["description"]

    db.commit()
    db.refresh(category)
    log_action(db, user=user, action="category.updated", entity_type="category", entity_id=category.id)
    return {"data": CategoryOut.model_validate(category)}


@router.delete("/{category_id}", status_code=204)
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("owner", "admin")),
) -> None:
    category = db.get(Category, category_id)
    if category is None:
        raise NotFoundError("Catégorie introuvable.")
    if category.products:
        raise ConflictError("Impossible de supprimer une catégorie contenant des produits.")

    db.delete(category)
    db.commit()
    log_action(db, user=user, action="category.deleted", entity_type="category", entity_id=category_id)
