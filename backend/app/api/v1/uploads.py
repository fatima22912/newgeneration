import os
import uuid

import httpx
from fastapi import APIRouter, Depends, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.dependencies import require_role
from app.db.session import get_db
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
    if settings.supabase_url and settings.supabase_service_role_key:
        base_url = settings.supabase_url.rstrip("/")
        bucket = settings.supabase_storage_bucket
        object_path = f"products/{product_id}/{filename}"
        headers = {
            "Authorization": f"Bearer {settings.supabase_service_role_key}",
            "apikey": settings.supabase_service_role_key,
            "Content-Type": file.content_type or "application/octet-stream",
            "x-upsert": "false",
        }
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.post(
                    f"{base_url}/storage/v1/object/{bucket}/{object_path}",
                    content=content,
                    headers=headers,
                )
                response.raise_for_status()
        except httpx.HTTPError as exc:
            raise HTTPException(
                status_code=502,
                detail="Impossible d’enregistrer l’image dans le stockage distant.",
            ) from exc
        image_url = f"{base_url}/storage/v1/object/public/{bucket}/{object_path}"
    else:
        os.makedirs(settings.upload_dir, exist_ok=True)
        file_path = os.path.join(settings.upload_dir, filename)
        with open(file_path, "wb") as f:
            f.write(content)
        image_url = f"/uploads/{filename}"

    image = product_service.add_product_image(db, product_id, image_url)
    log_action(
        db, user=user, action="product.image_added", entity_type="product", entity_id=product_id
    )
    return {"data": ProductImageOut.model_validate(image)}
