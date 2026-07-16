class AppError(Exception):
    """Exception métier de base. Convertie en réponse {error:{code,message}}
    par le gestionnaire d'erreurs global (voir middlewares/error_handler.py)."""

    status_code = 400
    code = "app_error"

    def __init__(self, message: str, *, code: str | None = None, status_code: int | None = None):
        super().__init__(message)
        self.message = message
        if code:
            self.code = code
        if status_code:
            self.status_code = status_code


class NotFoundError(AppError):
    status_code = 404
    code = "not_found"


class ConflictError(AppError):
    status_code = 409
    code = "conflict"


class ValidationAppError(AppError):
    status_code = 422
    code = "validation_error"


class UnauthorizedError(AppError):
    status_code = 401
    code = "unauthorized"


class ForbiddenError(AppError):
    status_code = 403
    code = "forbidden"


class AccountLockedError(AppError):
    status_code = 423
    code = "account_locked"


class InsufficientStockError(AppError):
    status_code = 409
    code = "insufficient_stock"
