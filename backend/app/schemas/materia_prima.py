from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

# ==================== UNIDADES DE MEDIDA ====================

class UnidadMedidaCreate(BaseModel):
    nombre: str
    abreviacion: str
    tipo: str  # peso, volumen, cantidad

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
    instagram: Optional[str] = None
    email: Optional[str] = None

class ProveedorUpdate(BaseModel):
    nombre: Optional[str] = None
    domicilio: Optional[str] = None
    telefono: Optional[str] = None
    celular: Optional[str] = None
    instagram: Optional[str] = None
    email: Optional[str] = None
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
    categoria_id: int
    unidad_medida_id: int
    precio_unitario: Optional[float] = None
    stock_minimo: float = 0

class ProductoMateriaPrimaUpdate(BaseModel):
    nombre: Optional[str] = None
    categoria_id: Optional[int] = None
    unidad_medida_id: Optional[int] = None
    precio_unitario: Optional[float] = None
    stock_minimo: Optional[float] = None
    activo: Optional[bool] = None

class ProductoMateriaPrimaRead(ProductoMateriaPrimaCreate):
    id: int
    activo: bool
    created_at: datetime
    updated_at: datetime
    categoria: CategoriaMateriaPrimaRead
    unidad_medida: UnidadMedidaRead

    class Config:
        from_attributes = True

# ==================== LOTES DE MATERIA PRIMA ====================

class LoteMateriaPrimaCreate(BaseModel):
    producto_id: int
    proveedor_id: int
    cantidad_inicial: float
    precio_total: float
    fecha_vencimiento: Optional[datetime] = None
    lote_numero: Optional[str] = None

class LoteMateriaPrimaUpdate(BaseModel):
    cantidad_actual: Optional[float] = None
    activo: Optional[bool] = None

class LoteMateriaPrimaRead(BaseModel):
    id: int
    producto_id: int
    proveedor_id: int
    cantidad_inicial: float
    cantidad_actual: float
    precio_total: float
    fecha_compra: datetime
    fecha_vencimiento: Optional[datetime]
    lote_numero: Optional[str]
    activo: bool
    producto: ProductoMateriaPrimaRead
    proveedor: ProveedorRead

    class Config:
        from_attributes = True