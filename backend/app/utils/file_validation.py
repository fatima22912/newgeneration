import filetype

from app.core.config import get_settings
from app.core.exceptions import ValidationAppError

settings = get_settings()

ALLOWED_IMAGE_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}


def validate_image_upload(content: bytes) -> str:
    """Vérifie la taille et le type MIME réel (magic bytes) d'une image
    uploadée. Retourne l'extension de fichier à utiliser. Lève
    ValidationAppError si le fichier n'est pas une image autorisée.
    """
    max_bytes = settings.max_upload_size_mb * 1024 * 1024
    if len(content) > max_bytes:
        raise ValidationAppError(
            f"Fichier trop volumineux (max {settings.max_upload_size_mb} Mo)."
        )

    kind = filetype.guess(content)
    if kind is None or kind.mime not in ALLOWED_IMAGE_MIME_TYPES:
        raise ValidationAppError("Format d'image non supporté (jpeg, png, webp uniquement).")

    return kind.extension
