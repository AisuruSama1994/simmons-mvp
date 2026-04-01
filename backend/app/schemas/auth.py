from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List

# ==================== AUTENTICACIÓN ====================

class LoginRequest(BaseModel):
    username: str  # email
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str

# ==================== USUARIOS ====================

class RolBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None

class RolRead(RolBase):
    id: int

    class Config:
        from_attributes = True

class UsuarioCreate(BaseModel):
    nombre: str
    email: EmailStr
    password: str
    rol_id: int
    sucursal_id: Optional[int] = None

class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = None
    email: Optional[EmailStr] = None
    rol_id: Optional[int] = None
    activo: Optional[bool] = None

class UsuarioRead(BaseModel):
    id: int
    nombre: str
    email: str
    rol_id: int
    rol: RolRead
    sucursal_id: Optional[int]
    activo: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class UsuarioReadMe(BaseModel):
    id: int
    nombre: str
    email: str
    rol: RolRead
    activo: bool

    class Config:
        from_attributes = True