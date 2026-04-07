from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional

# ==================== UNIDADES DE MEDIDA ====================

class UnidadMedidaCreate(BaseModel):
    nombre: str
    abreviacion: str
    tipo: str

class UnidadMedidaRead(UnidadMedidaCreate):
    id: int
    class Config:
        from_attributes = True

# ==================== PROVEEDORES ====================

class ProveedorCreate(BaseModel):
    nombre: str
    domicilio: Optional[str] = None
    telefono: Optional[str] = None
    celular: Optional[str] = None
    whatsapp: Optional[str] = None
    instagram: Optional[str] = None
    facebook: Optional[str] = None
    website: Optional[str] = None
    email: Optional[str] = None
    notas: Optional[str] = None

class ProveedorUpdate(ProveedorCreate):
    nombre: Optional[str] = None
    activo: Optional[bool] = None

class ProveedorRead(ProveedorCreate):
    id: int
    activo: bool
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

# ==================== CATEGORÍAS ====================

class CategoriaMateriaPrimaCreate(BaseModel):
    nombre: str
    descripcion: Optional[str] = None

class CategoriaMateriaPrimaRead(CategoriaMateriaPrimaCreate):
    id: int
    class Config:
        from_attributes = True

# ==================== PRODUCTOS DE MATERIA PRIMA ====================

class ProductoMateriaPrimaCreate(BaseModel):
    nombre: str
    marca: Optional[str] = None
    presentacion: Optional[str] = None
    codigo_barras: Optional[str] = None
    descripcion: Optional[str] = None
    categoria_id: Optional[int] = None
    unidad_medida_id: Optional[int] = None
    stock_minimo: float = 0

class ProductoMateriaPrimaUpdate(BaseModel):
    nombre: Optional[str] = None
    marca: Optional[str] = None
    presentacion: Optional[str] = None
    codigo_barras: Optional[str] = None
    descripcion: Optional[str] = None
    categoria_id: Optional[int] = None
    unidad_medida_id: Optional[int] = None
    stock_minimo: Optional[float] = None
    activo: Optional[bool] = None

class ProductoMateriaPrimaRead(BaseModel):
    id: int
    nombre: str
    marca: Optional[str] = None
    presentacion: Optional[str] = None
    codigo_barras: Optional[str] = None
    descripcion: Optional[str] = None
    categoria_id: Optional[int] = None
    unidad_medida_id: Optional[int] = None
    stock_minimo: float
    activo: bool
    created_at: datetime
    updated_at: datetime
    categoria: Optional[CategoriaMateriaPrimaRead] = None
    unidad_medida: Optional[UnidadMedidaRead] = None
    class Config:
        from_attributes = True

# ==================== LOTES DE MATERIA PRIMA ====================

class LoteMateriaPrimaCreate(BaseModel):
    producto_id: int
    proveedor_id: Optional[int] = None
    cantidad_inicial: float
    precio_total: float
    precio_unitario: Optional[float] = None
    fecha_vencimiento: Optional[datetime] = None
    fecha_compra: Optional[datetime] = None
    lote_numero: Optional[str] = None
    codigo_barras_lote: Optional[str] = None

    @field_validator("fecha_compra", "fecha_vencimiento", mode="before")
    @classmethod
    def empty_string_to_none(cls, v):
        if v == "" or v is None:
            return None
        return v

class LoteMateriaPrimaUpdate(BaseModel):
    cantidad_actual: Optional[float] = None
    activo: Optional[bool] = None

class LoteMateriaPrimaRead(BaseModel):
    id: int
    producto_id: int
    proveedor_id: Optional[int] = None
    cantidad_inicial: float
    cantidad_actual: float
    precio_total: float
    precio_unitario: Optional[float] = None
    fecha_compra: datetime
    fecha_vencimiento: Optional[datetime] = None
    lote_numero: Optional[str] = None
    codigo_barras_lote: Optional[str] = None
    activo: bool
    producto: ProductoMateriaPrimaRead
    proveedor: ProveedorRead
    class Config:
        from_attributes = True
