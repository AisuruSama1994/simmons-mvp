from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from app.models.produccion import OrdenProduccion, TransformacionProduccion
from app.models.recetas_productos import Receta, RecetaIngrediente, LoteProducto, InventarioProductoPorEstado
from app.models.base import Usuario
from datetime import datetime
from typing import Optional
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1", tags=["produccion"])

# ==================== SCHEMAS ====================

class OrdenProduccionCreate(BaseModel):
    receta_id: int
    cantidad_objetivo: float

class OrdenProduccionUpdate(BaseModel):
    cantidad_producida: Optional[float] = None
    estado: Optional[str] = None
    notas: Optional[str] = None

class OrdenProduccionRead(BaseModel):
    id: int
    receta_id: int
    cantidad_objetivo: float
    cantidad_producida: float
    estado: str
    fecha_inicio: Optional[datetime]
    fecha_finalizacion: Optional[datetime]
    notas: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class TransformacionCreate(BaseModel):
    orden_id: int
    tipo_transformacion: str
    cantidad: float
    estado_anterior: str
    estado_nuevo: str

class TransformacionRead(BaseModel):
    id: int
    orden_id: int
    tipo_transformacion: str
    cantidad: float
    estado_anterior: str
    estado_nuevo: str
    fecha: datetime

    class Config:
        from_attributes = True

# ==================== ÓRDENES DE PRODUCCIÓN ====================

@router.get("/produccion/ordenes", response_model=list[OrdenProduccionRead])
def get_ordenes(
    estado: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Obtener órdenes de producción"""
    query = db.query(OrdenProduccion)
    
    if estado:
        query = query.filter(OrdenProduccion.estado == estado)
    
    return query.order_by(OrdenProduccion.created_at.desc()).offset(skip).limit(limit).all()

@router.post("/produccion/ordenes", response_model=OrdenProduccionRead)
def create_orden(data: OrdenProduccionCreate, db: Session = Depends(get_db)):
    """Crear orden de producción (sin validación de stock por ahora)"""
    # Verificar que receta existe
    receta = db.query(Receta).filter(Receta.id == data.receta_id).first()
    if not receta:
        raise HTTPException(status_code=400, detail="Receta no encontrada")
    
    orden = OrdenProduccion(
        receta_id=data.receta_id,
        cantidad_objetivo=data.cantidad_objetivo,
        estado="pendiente"
    )
    
    db.add(orden)
    db.commit()
    db.refresh(orden)
    return orden

@router.get("/produccion/ordenes/{id}", response_model=OrdenProduccionRead)
def get_orden(id: int, db: Session = Depends(get_db)):
    """Obtener orden por ID"""
    orden = db.query(OrdenProduccion).filter(OrdenProduccion.id == id).first()
    if not orden:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    return orden

@router.put("/produccion/ordenes/{id}", response_model=OrdenProduccionRead)
def update_orden(id: int, data: OrdenProduccionUpdate, db: Session = Depends(get_db)):
    """Actualizar orden de producción"""
    orden = db.query(OrdenProduccion).filter(OrdenProduccion.id == id).first()
    if not orden:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    
    for key, value in data.dict(exclude_unset=True).items():
        if key == "estado" and value == "en_progreso" and not orden.fecha_inicio:
            orden.fecha_inicio = datetime.utcnow()
        elif key == "estado" and value == "completada" and not orden.fecha_finalizacion:
            orden.fecha_finalizacion = datetime.utcnow()
        else:
            setattr(orden, key, value)
    
    db.commit()
    db.refresh(orden)
    return orden

# ==================== TRANSFORMACIONES ====================

@router.post("/produccion/transformaciones", response_model=TransformacionRead)
def create_transformacion(data: TransformacionCreate, db: Session = Depends(get_db)):
    """Crear transformación de producción"""
    # Verificar orden
    orden = db.query(OrdenProduccion).filter(OrdenProduccion.id == data.orden_id).first()
    if not orden:
        raise HTTPException(status_code=400, detail="Orden no encontrada")
    
    # Crear lote destino si no existe
    lote_destino = LoteProducto(
        producto_id=orden.receta.productos[0].id if orden.receta.productos else 1,
        cantidad=data.cantidad,
        estado=data.estado_nuevo
    )
    db.add(lote_destino)
    db.flush()
    
    # Crear transformación
    transformacion = TransformacionProduccion(
        orden_id=data.orden_id,
        lote_destino_id=lote_destino.id,
        tipo_transformacion=data.tipo_transformacion,
        cantidad=data.cantidad,
        estado_anterior=data.estado_anterior,
        estado_nuevo=data.estado_nuevo
    )
    
    # Actualizar inventario
    inventario = db.query(InventarioProductoPorEstado).filter(
        InventarioProductoPorEstado.producto_id == lote_destino.producto_id,
        InventarioProductoPorEstado.estado == data.estado_nuevo
    ).first()
    
    if inventario:
        inventario.cantidad += data.cantidad
    
    # Actualizar cantidad producida en orden
    orden.cantidad_producida = (orden.cantidad_producida or 0) + data.cantidad
    
    db.add(transformacion)
    db.commit()
    db.refresh(transformacion)
    return transformacion

@router.get("/produccion/transformaciones/{id}", response_model=TransformacionRead)
def get_transformacion(id: int, db: Session = Depends(get_db)):
    """Obtener transformación por ID"""
    transformacion = db.query(TransformacionProduccion).filter(
        TransformacionProduccion.id == id
    ).first()
    if not transformacion:
        raise HTTPException(status_code=404, detail="Transformación no encontrada")
    return transformacion

@router.get("/produccion/ordenes/{id}/transformaciones", response_model=list[TransformacionRead])
def get_transformaciones_orden(id: int, db: Session = Depends(get_db)):
    """Obtener transformaciones de una orden"""
    return db.query(TransformacionProduccion).filter(
        TransformacionProduccion.orden_id == id
    ).all()

# ==================== REPORTES ====================

@router.get("/produccion/reporte/pendientes")
def reporte_ordenes_pendientes(db: Session = Depends(get_db)):
    """Obtener órdenes pendientes"""
    ordenes = db.query(OrdenProduccion).filter(
        OrdenProduccion.estado != "completada"
    ).all()
    
    return {
        "cantidad_ordenes": len(ordenes),
        "ordenes": [
            {
                "id": o.id,
                "receta": o.receta.nombre,
                "cantidad_objetivo": o.cantidad_objetivo,
                "cantidad_producida": o.cantidad_producida,
                "progreso": (o.cantidad_producida or 0) / o.cantidad_objetivo * 100,
                "estado": o.estado
            }
            for o in ordenes
        ]
    }

@router.get("/produccion/reporte/productividad")
def reporte_productividad(db: Session = Depends(get_db)):
    """Reporte de productividad"""
    from datetime import timedelta
    
    hoy = datetime.utcnow().date()
    ordenes_hoy = db.query(OrdenProduccion).filter(
        OrdenProduccion.created_at >= hoy
    ).all()
    
    total_objetivo = sum(o.cantidad_objetivo for o in ordenes_hoy)
    total_producido = sum(o.cantidad_producida or 0 for o in ordenes_hoy)
    
    return {
        "fecha": hoy,
        "cantidad_ordenes": len(ordenes_hoy),
        "cantidad_objetivo_total": total_objetivo,
        "cantidad_producida_total": total_producido,
        "eficiencia": (total_producido / total_objetivo * 100) if total_objetivo > 0 else 0,
        "ordenes_completadas": len([o for o in ordenes_hoy if o.estado == "completada"]),
        "ordenes_en_progreso": len([o for o in ordenes_hoy if o.estado == "en_progreso"])
    }