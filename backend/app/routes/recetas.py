from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from app.models.recetas_productos import Receta, RecetaIngrediente
from app.models.materia_prima import UnidadMedida, ProductoMateriaPrima
from typing import Optional
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1", tags=["recetas"])

# ==================== SCHEMAS ====================

class RecetaIngredienteCreate(BaseModel):
    """
    Crear ingrediente para receta.
    
    ❌ YA NO se envía unidad_medida_id
    ✅ Se hereda de ProductoMateriaPrima.unidad_medida_id
    
    EJEMPLO:
    {
        "producto_materia_prima_id": 1,  # MANTECA
        "cantidad": 100
    }
    """
    producto_materia_prima_id: int
    cantidad: float

class RecetaIngredienteRead(BaseModel):
    id: int
    receta_id: int
    producto_materia_prima_id: int
    producto_nombre: Optional[str] = None
    cantidad: float
    unidad_medida_id: int
    unidad_nombre: Optional[str] = None
    unidad_abreviacion: Optional[str] = None

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
    unidad_rendimiento_nombre: Optional[str] = None
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
    # Verificar que unidad de rendimiento existe
    unidad = db.query(UnidadMedida).filter(UnidadMedida.id == data.unidad_rendimiento_id).first()
    if not unidad:
        raise HTTPException(status_code=400, detail="Unidad de rendimiento no encontrada")

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

    # Validar e agregar ingredientes
    for ing_data in data.ingredientes:
        # Verificar que la materia prima existe
        producto = db.query(ProductoMateriaPrima).filter(
            ProductoMateriaPrima.id == ing_data.producto_materia_prima_id
        ).first()
        if not producto:
            raise HTTPException(
                status_code=400, 
                detail=f"Producto materia prima {ing_data.producto_materia_prima_id} no encontrado"
            )
        
        # Crear ingrediente (sin unidad_medida_id, viene de ProductoMateriaPrima)
        ingrediente = RecetaIngrediente(
            receta_id=receta.id,
            producto_materia_prima_id=ing_data.producto_materia_prima_id,
            cantidad=ing_data.cantidad
        )
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

# ==================== INGREDIENTES (endpoints adicionales) ====================

@router.post("/receta-ingredientes", response_model=RecetaIngredienteRead)
def create_ingrediente(
    receta_id: int,
    producto_materia_prima_id: int,
    cantidad: float,
    db: Session = Depends(get_db)
):
    """
    Agregar ingrediente a una receta existente.
    
    Query params:
    - receta_id: ID de la receta
    - producto_materia_prima_id: ID de la materia prima
    - cantidad: Cantidad a usar
    """
    # Verificar que receta existe
    receta = db.query(Receta).filter(Receta.id == receta_id).first()
    if not receta:
        raise HTTPException(status_code=404, detail="Receta no encontrada")
    
    # Verificar que producto existe
    producto = db.query(ProductoMateriaPrima).filter(
        ProductoMateriaPrima.id == producto_materia_prima_id
    ).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto materia prima no encontrado")
    
    # Crear ingrediente
    ingrediente = RecetaIngrediente(
        receta_id=receta_id,
        producto_materia_prima_id=producto_materia_prima_id,
        cantidad=cantidad
    )
    db.add(ingrediente)
    db.commit()
    db.refresh(ingrediente)
    return ingrediente

@router.delete("/receta-ingredientes/{id}")
def delete_ingrediente(id: int, db: Session = Depends(get_db)):
    """Eliminar ingrediente de una receta"""
    ingrediente = db.query(RecetaIngrediente).filter(RecetaIngrediente.id == id).first()
    if not ingrediente:
        raise HTTPException(status_code=404, detail="Ingrediente no encontrado")
    
    db.delete(ingrediente)
    db.commit()
    return {"message": "Ingrediente eliminado"}