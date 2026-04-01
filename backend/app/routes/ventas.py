from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from app.models.ventas import Venta, VentaItem
from app.models.recetas_productos import Producto, InventarioProductoPorEstado
from app.models.base import Usuario
from datetime import datetime
from typing import Optional
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1", tags=["ventas"])

# ==================== SCHEMAS ====================

class VentaItemCreate(BaseModel):
    producto_id: int
    cantidad: float
    precio_unitario: float

class VentaItemRead(BaseModel):
    id: int
    producto_id: int
    cantidad: float
    precio_unitario: float
    subtotal: float

    class Config:
        from_attributes = True

class VentaCreate(BaseModel):
    cliente_nombre: Optional[str] = None
    cliente_email: Optional[str] = None
    cliente_telefono: Optional[str] = None
    metodo_pago: Optional[str] = None
    tipo_venta: str = "mostrador"
    descuento: float = 0
    items: list[VentaItemCreate]

class VentaUpdate(BaseModel):
    estado: Optional[str] = None

class VentaRead(BaseModel):
    id: int
    numero_venta: str
    fecha: datetime
    cliente_nombre: Optional[str]
    cliente_email: Optional[str]
    cliente_telefono: Optional[str]
    monto_total: float
    descuento: float
    monto_final: float
    metodo_pago: Optional[str]
    tipo_venta: str
    estado: str
    items: list[VentaItemRead] = []

    class Config:
        from_attributes = True

# ==================== VENTAS ====================

def generate_numero_venta(db: Session) -> str:
    """Generar número de venta único"""
    today = datetime.now()
    date_prefix = today.strftime("%Y%m%d")
    
    count = db.query(func.count(Venta.id)).filter(
        func.date(Venta.fecha) == today.date()
    ).scalar() or 0
    
    return f"V{date_prefix}{str(count + 1).zfill(4)}"

@router.get("/ventas", response_model=list[VentaRead])
def get_ventas(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Obtener todas las ventas"""
    return db.query(Venta).order_by(Venta.fecha.desc()).offset(skip).limit(limit).all()

@router.post("/ventas", response_model=VentaRead)
def create_venta(data: VentaCreate, db: Session = Depends(get_db)):
    """Crear venta"""
    # Generar número de venta
    numero_venta = generate_numero_venta(db)
    
    # Calcular montos
    monto_total = 0
    items_list = []
    
    for item_data in data.items:
        # Verificar que producto existe
        producto = db.query(Producto).filter(Producto.id == item_data.producto_id).first()
        if not producto:
            raise HTTPException(status_code=400, detail=f"Producto {item_data.producto_id} no encontrado")
        
        subtotal = item_data.cantidad * item_data.precio_unitario
        monto_total += subtotal
        
        items_list.append({
            "producto_id": item_data.producto_id,
            "cantidad": item_data.cantidad,
            "precio_unitario": item_data.precio_unitario,
            "subtotal": subtotal,
            "descuento_item": 0
        })
    
    monto_final = monto_total - data.descuento
    
    # Crear venta
    venta = Venta(
        numero_venta=numero_venta,
        cliente_nombre=data.cliente_nombre,
        cliente_email=data.cliente_email,
        cliente_telefono=data.cliente_telefono,
        monto_total=monto_total,
        descuento=data.descuento,
        monto_final=monto_final,
        metodo_pago=data.metodo_pago,
        tipo_venta=data.tipo_venta,
        estado="completada"
    )
    
    # Agregar items
    for item_data in items_list:
        venta_item = VentaItem(**item_data)
        venta.items.append(venta_item)
        
        # Descontar del inventario (estado "cocido" por defecto)
        inventario = db.query(InventarioProductoPorEstado).filter(
            InventarioProductoPorEstado.producto_id == item_data["producto_id"],
            InventarioProductoPorEstado.estado == "cocido"
        ).first()
        
        if inventario:
            inventario.cantidad -= item_data["cantidad"]
    
    db.add(venta)
    db.commit()
    db.refresh(venta)
    return venta

@router.get("/ventas/{id}", response_model=VentaRead)
def get_venta(id: int, db: Session = Depends(get_db)):
    """Obtener venta por ID"""
    venta = db.query(Venta).filter(Venta.id == id).first()
    if not venta:
        raise HTTPException(status_code=404, detail="Venta no encontrada")
    return venta

@router.put("/ventas/{id}", response_model=VentaRead)
def update_venta(id: int, data: VentaUpdate, db: Session = Depends(get_db)):
    """Actualizar venta"""
    venta = db.query(Venta).filter(Venta.id == id).first()
    if not venta:
        raise HTTPException(status_code=404, detail="Venta no encontrada")
    
    for key, value in data.dict(exclude_unset=True).items():
        setattr(venta, key, value)
    
    db.commit()
    db.refresh(venta)
    return venta

# ==================== REPORTES DE VENTAS ====================

@router.get("/ventas/reporte/diario")
def reporte_ventas_diario(db: Session = Depends(get_db)):
    """Reporte de ventas del día"""
    today = datetime.now().date()
    
    ventas = db.query(Venta).filter(
        func.date(Venta.fecha) == today
    ).all()
    
    total_ventas = sum(v.monto_final for v in ventas)
    cantidad_ventas = len(ventas)
    promedio = total_ventas / cantidad_ventas if cantidad_ventas > 0 else 0
    
    return {
        "fecha": today,
        "cantidad_ventas": cantidad_ventas,
        "monto_total": total_ventas,
        "promedio_venta": promedio,
        "ventas": [
            {
                "numero": v.numero_venta,
                "monto": v.monto_final,
                "hora": v.fecha.strftime("%H:%M")
            }
            for v in ventas
        ]
    }

@router.get("/ventas/reporte/semanal")
def reporte_ventas_semanal(db: Session = Depends(get_db)):
    """Reporte de ventas últimos 7 días"""
    from datetime import timedelta
    
    dias_atras = datetime.now() - timedelta(days=7)
    
    ventas = db.query(Venta).filter(
        Venta.fecha >= dias_atras
    ).all()
    
    # Agrupar por día
    por_dia = {}
    for venta in ventas:
        dia = venta.fecha.date()
        if dia not in por_dia:
            por_dia[dia] = {"cantidad": 0, "monto": 0}
        por_dia[dia]["cantidad"] += 1
        por_dia[dia]["monto"] += venta.monto_final
    
    return {
        "periodo": "últimos 7 días",
        "total_ventas": sum(v.monto_final for v in ventas),
        "cantidad_ventas": len(ventas),
        "por_dia": por_dia
    }

@router.get("/ventas/productos-mas-vendidos")
def productos_mas_vendidos(limit: int = 10, db: Session = Depends(get_db)):
    """Obtener productos más vendidos"""
    resultados = db.query(
        VentaItem.producto_id,
        Producto.nombre,
        func.sum(VentaItem.cantidad).label("cantidad_total"),
        func.sum(VentaItem.subtotal).label("monto_total")
    ).join(Producto).group_by(
        VentaItem.producto_id, Producto.nombre
    ).order_by(
        func.sum(VentaItem.cantidad).desc()
    ).limit(limit).all()
    
    return [
        {
            "producto_id": r[0],
            "nombre": r[1],
            "cantidad_vendida": r[2],
            "monto_total": r[3]
        }
        for r in resultados
    ]