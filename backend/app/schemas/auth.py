from pydantic import BaseModel, EmailStr, Field

from app.schemas.user import UserPublicOut


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in_minutes: int
    user: UserPublicOut


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=12)
