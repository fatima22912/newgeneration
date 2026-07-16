import datetime

from pydantic import BaseModel, EmailStr, Field

from app.models.user import UserRole


class UserPublicOut(BaseModel):
    id: int
    role: UserRole
    full_name: str
    email: EmailStr
    phone: str | None = None
    is_active: bool

    model_config = {"from_attributes": True}


class OwnerOut(UserPublicOut):
    failed_login_attempts: int
    locked_until: datetime.datetime | None = None
    created_by: int | None = None
    created_at: datetime.datetime


class OwnerCreateRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=150)
    email: EmailStr
    phone: str | None = Field(default=None, max_length=30)


class OwnerCreateResponse(BaseModel):
    owner: OwnerOut
    temporary_password: str


class OwnerUpdateRequest(BaseModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=150)
    email: EmailStr | None = None
    phone: str | None = Field(default=None, max_length=30)
