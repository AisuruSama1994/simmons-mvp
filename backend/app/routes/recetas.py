from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from app.models.recetas_productos import Receta, RecetaIngrediente
from app.models.materia_prima import UnidadMedida
from typing import Optional
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1", tags=["recetas"])

# ==================== SCHEMAS ====================

class RecetaIngredienteCreate(BaseModel):
    producto_materia_prima_id: int
    cantidad: float
    unidad_medida_id: int

class RecetaIngredienteRead(BaseModel):
    id: int
    producto_materia_prima_id: int
    cantidad: float
    unidad_medida_id: int

    class Config:
        from_attributes = True

class RecetaCreate(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    tiempo_preparacion: Optional[int] = None
    tiempo_coccion: Optional[int] = None
    rendimiento: float
    unidad_rendimiento_id: int
    costo_estimado: Optional[float] = None
    ingredientes: list[RecetaIngredienteCreate] = []

class RecetaUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    tiempo_preparacion: Optional[int] = None
    tiempo_coccion: Optional[int] = None
    rendimiento: Optional[float] = None
    unidad_rendimiento_id: Optional[int] = None
    costo_estimado: Optional[float] = None
    activo: Optional[bool] = None

class RecetaRead(BaseModel):
    id: int
    nombre: str
    descripcion: Optional[str]
    tiempo_preparacion: Optional[int]
    tiempo_coccion: Optional[int]
    rendimiento: float
    unidad_rendimiento_id: int
    costo_estimado: Optional[float]
    activo: bool
    ingredientes: list[RecetaIngredienteRead] = []

    class Config:
        from_attributes = True

# ==================== RECETAS ====================

@router.get("/recetas", response_model=list[RecetaRead])
def get_recetas(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Obtener todas las recetas"""
    return db.query(Receta).filter(Receta.activo == True).offset(skip).limit(limit).all()

@router.post("/recetas", response_model=RecetaRead)
def create_receta(data: RecetaCreate, db: Session = Depends(get_db)):
    """Crear receta con ingredientes"""
    # Verificar que unidad existe
    unidad = db.query(UnidadMedida).filter(UnidadMedida.id == data.unidad_rendimiento_id).first()
    if not unidad:
        raise HTTPException(status_code=400, detail="Unidad no encontrada")
    
    # Crear receta
    receta = Receta(
        nombre=data.nombre,
        descripcion=data.descripcion,
        tiempo_preparacion=data.tiempo_preparacion,
        tiempo_coccion=data.tiempo_coccion,
        rendimiento=data.rendimiento,
        unidad_rendimiento_id=data.unidad_rendimiento_id,
        costo_estimado=data.costo_estimado,
    )
    
    # Agregar ingredientes
    for ing_data in data.ingredientes:
        ingrediente = RecetaIngrediente(**ing_data.dict())
        receta.ingredientes.append(ingrediente)
    
    db.add(receta)
    db.commit()
    db.refresh(receta)
    return receta

@router.get("/recetas/{id}", response_model=RecetaRead)
def get_receta(id: int, db: Session = Depends(get_db)):
    """Obtener receta por ID"""
    receta = db.query(Receta).filter(Receta.id == id).first()
    if not receta:
        raise HTTPException(status_code=404, detail="Receta no encontrada")
    return receta

@router.put("/recetas/{id}", response_model=RecetaRead)
def update_receta(id: int, data: RecetaUpdate, db: Session = Depends(get_db)):
    """Actualizar receta"""
    receta = db.query(Receta).filter(Receta.id == id).first()
    if not receta:
        raise HTTPException(status_code=404, detail="Receta no encontrada")
    
    for key, value in data.dict(exclude_unset=True).items():
        setattr(receta, key, value)
    
    db.commit()
    db.refresh(receta)
    return receta

@router.delete("/recetas/{id}")
def delete_receta(id: int, db: Session = Depends(get_db)):
    """Eliminar receta (soft delete)"""
    receta = db.query(Receta).filter(Receta.id == id).first()
    if not receta:
        raise HTTPException(status_code=404, detail="Receta no encontrada")
    
    receta.activo = False
    db.commit()
    return {"message": "Receta eliminada"}