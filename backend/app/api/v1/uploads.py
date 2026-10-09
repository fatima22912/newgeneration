import os
import uuid

from fastapi import APIRouter, Depends, UploadFile
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.dependencies import require_role
from app.core.exceptions import NotFoundError
from app.db.session import get_db
from app.models.product_image import ProductImage
from app.models.user import User
from app.schemas.product import ProductImageOut
from app.services import product_service
from app.services.activity_log_service import log_action
from app.utils.file_validation import validate_image_upload

router = APIRouter(prefix="/products", tags=["uploads"])
settings = get_settings()


@router.post("/{product_id}/images", status_code=201)
async def upload_product_image(
    product_id: int,
    file: UploadFile,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("owner", "admin")),
) -> dict:
    # Vérifie que le produit existe avant de toucher au disque.
    product_service.get_product(db, product_id, include_inactive=True)

    content = await file.read()
    extension = validate_image_upload(content)

    filename = f"{uuid.uuid4().hex}.{extension}"
    os.makedirs(settings.upload_dir, exist_ok=True)
    file_path = os.path.join(settings.upload_dir, filename)
    with open(file_path, "wb") as f:
        f.write(content)

    image = product_service.add_product_image(db, product_id, f"/uploads/{filename}")
    log_action(
        db, user=user, action="product.image_added", entity_type="product", entity_id=product_id
    )
    return {"data": ProductImageOut.model_validate(image)}


@router.delete("/{product_id}/images/{image_id}", status_code=204)
def delete_product_image(
    product_id: int,
    image_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("owner", "admin")),
) -> None:
    product_service.get_product(db, product_id, include_inactive=True)
    image = (
        db.query(ProductImage)
        .filter(ProductImage.id == image_id, ProductImage.product_id == product_id)
        .first()
    )
    if image is None:
        raise NotFoundError("Photo introuvable.")

    image_url = image.image_url
    db.delete(image)
    db.commit()

    # Remove the local file when it belongs to this app. Missing old files do
    # not prevent their database entry from being removed.
    if image_url.startswith("/uploads/"):
        filename = image_url.removeprefix("/uploads/")
        if filename and os.path.basename(filename) == filename:
            try:
                os.remove(os.path.join(settings.upload_dir, filename))
            except OSError:
                pass

    log_action(
        db, user=user, action="product.image_removed", entity_type="product", entity_id=product_id
    )
