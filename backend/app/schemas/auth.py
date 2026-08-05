from pydantic import BaseModel, EmailStr
from typing import Optional


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Optional[str] = "Student"
    college: Optional[str] = ""
    department: Optional[str] = ""
    year: Optional[str] = ""


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class GoogleLoginRequest(BaseModel):
    email: EmailStr
    name: str
    avatar: Optional[str] = None



class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    bio: str
    avatar: str
    college: str
    department: str
    year: str
    git_nickname: str
    skills: list[str] = []

    model_config = {"from_attributes": True}


TokenResponse.model_rebuild()
