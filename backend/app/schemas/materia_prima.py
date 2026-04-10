from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# ==================== UNIDADES DE MEDIDA ====================

class UnidadMedidaCreate(BaseModel):
    nombre: str
    abreviacion: str
    tipo: str  # peso, volumen, cantidad

class UnidadMedidaRead(BaseModel):
    id: int
    nombre: str
    abreviacion: str
    tipo: str

    class Config:
        from_attributes = True

# ==================== PROVEEDORES ====================

class ProveedorCreate(BaseModel):
    nombre: str
    domicilio: Optional[str] = None
    telefono: Optional[str] = None
    celular: Optional[str] = None
    whatsapp: Optional[str] = None
    email: Optional[str] = None
    instagram: Optional[str] = None
    facebook: Optional[str] = None
    website: Optional[str] = None
    notas: Optional[str] = None

class ProveedorUpdate(BaseModel):
    nombre: Optional[str] = None
    domicilio: Optional[str] = None
    telefono: Optional[str] = None
    celular: Optional[str] = None
    whatsapp: Optional[str] = None
    email: Optional[str] = None
    instagram: Optional[str] = None
    facebook: Optional[str] = None
    website: Optional[str] = None
    notas: Optional[str] = None
    activo: Optional[bool] = None

class ProveedorRead(BaseModel):
    id: int
    nombre: str
    domicilio: Optional[str]
    telefono: Optional[str]
    email: Optional[str]
    activo: bool

    class Config:
        from_attributes = True

# ==================== PRODUCTO MATERIA PRIMA ====================

class CategoriaMateriaPrimaCreate(BaseModel):
    nombre: str
    descripcion: Optional[str] = None

class CategoriaMateriaPrimaRead(BaseModel):
    id: int
    nombre: str
    descripcion: Optional[str]

    class Config:
        from_attributes = True

class ProductoMateriaPrimaCreate(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    categoria_id: int
    unidad_medida_id: int
    stock_minimo: float = 0

class ProductoMateriaPrimaUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    categoria_id: Optional[int] = None
    unidad_medida_id: Optional[int] = None
    stock_minimo: Optional[float] = None
    activo: Optional[bool] = None

class ProductoMateriaPrimaRead(BaseModel):
    id: int
    nombre: str
    descripcion: Optional[str]
    categoria_id: int
    unidad_medida_id: int
    stock_minimo: float
    activo: bool

    class Config:
        from_attributes = True

# ==================== LOTE MATERIA PRIMA (REFACTORIZADO) ====================

class LoteMateriaPrimaCreate(BaseModel):
    """
    Crear un lote de materia prima con presentación específica.
    
    EJEMPLO (MANTECA SERENÍSIMA):
    ────────────────────────────
    {
        "producto_id": 1,  # MANTECA
        "proveedor_id": 5,  # SERENÍSIMA
        "cantidad_presentacion": 5,  # 5 paquetes
        "unidad_presentacion_id": 6,  # UNIDADES
        "peso_unitario": 250,  # cada paquete pesa 250 gramos
        "cantidad_inicial": 1250,  # 5 * 250 (calculado, pero se envía para auditoría)
        "precio_unitario": 150.0,  # $ por paquete
        "precio_total": 750.0,  # 5 * 150
        "fecha_compra": "2026-04-08T10:30:00",
        "fecha_vencimiento": "2026-06-08",
        "lote_numero": "SEL-2026-04-001",
        "codigo_barras_lote": "7798012345678"
    }
    
    IMPORTANTE:
    - cantidad_actual se calcula automáticamente: cantidad_presentacion * peso_unitario
    - No se envía en la request, es calculado por el trigger de la BD
    """
    producto_id: int
    proveedor_id: int
    cantidad_presentacion: float
    unidad_presentacion_id: int
    peso_unitario: float
    cantidad_inicial: float
    precio_unitario: Optional[float] = None
    precio_total: float
    fecha_compra: Optional[datetime] = None
    fecha_vencimiento: Optional[datetime] = None
    lote_numero: Optional[str] = None
    codigo_barras_lote: Optional[str] = None

class LoteMateriaPrimaUpdate(BaseModel):
    """Actualizar un lote existente"""
    cantidad_presentacion: Optional[float] = None
    unidad_presentacion_id: Optional[int] = None
    peso_unitario: Optional[float] = None
    # cantidad_actual se recalcula automáticamente
    precio_unitario: Optional[float] = None
    precio_total: Optional[float] = None
    fecha_vencimiento: Optional[datetime] = None
    lote_numero: Optional[str] = None
    activo: Optional[bool] = None

class LoteMateriaPrimaRead(BaseModel):
    id: int
    producto_id: int
    proveedor_id: int
    cantidad_presentacion: float
    unidad_presentacion_id: Optional[int]
    peso_unitario: float
    cantidad_inicial: float
    cantidad_actual: float  # Calculado
    precio_unitario: Optional[float]
    precio_total: float
    fecha_compra: datetime
    fecha_vencimiento: Optional[datetime]
    lote_numero: Optional[str]
    codigo_barras_lote: Optional[str]
    activo: bool

    class Config:
        from_attributes = True

# ==================== STOCK TOTAL POR MATERIA PRIMA ====================

class StockTotalMateriaPrimaRead(BaseModel):
    """
    Información del stock total de una materia prima,
    sumando todos sus lotes activos.
    
    EJEMPLO (MANTECA):
    ─────────────────
    {
        "producto_id": 1,
        "producto_nombre": "MANTECA",
        "unidad_medida_nombre": "Gramo",
        "unidad_abreviacion": "g",
        "stock_total": 3750,  # 1250 (SERENÍSIMA) + 2500 (TONADITA)
        "cantidad_lotes": 2,
        "stock_minimo": 500,
        "estado_stock": "OK"
    }
    
    estado_stock puede ser:
    - "BAJO": stock_total < stock_minimo
    - "ALERTA": stock_minimo <= stock_total < stock_minimo * 1.5
    - "OK": stock_total >= stock_minimo * 1.5
    """
    producto_id: int
    producto_nombre: str
    unidad_medida_nombre: str
    unidad_abreviacion: str
    stock_total: float
    cantidad_lotes: int
    stock_minimo: float
    estado_stock: str  # BAJO, ALERTA, OK

    class Config:
        from_attributes = True

class DetalleLotsMateriaPrimaRead(BaseModel):
    """
    Detalle completo de un lote con información de auditoría.
    Útil para reportes y trazabilidad.
    """
    lote_id: int
    producto_nombre: str
    proveedor_nombre: str
    cantidad_presentacion: float
    unidad_presentacion: Optional[str]
    peso_unitario: float
    unidad_medida: str
    unidad_abreviacion: str
    cantidad_actual: float
    lote_numero: Optional[str]
    codigo_barras_lote: Optional[str]
    fecha_compra: datetime
    fecha_vencimiento: Optional[datetime]
    precio_unitario: Optional[float]
    precio_total: float
    activo: bool
    estado_vencimiento: str  # VENCIDO, PRÓXIMO A VENCER, VIGENTE

    class Config:
        from_attributes = True