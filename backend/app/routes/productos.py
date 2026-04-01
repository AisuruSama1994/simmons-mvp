from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from app.models.recetas_productos import Producto, InventarioProductoPorEstado
from app.models.recetas_productos import Receta
from typing import Optional
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1", tags=["productos"])

# ==================== SCHEMAS ====================

class ProductoCreate(BaseModel):
    nombre: str
    receta_id: int
    precio_unitario: float
    precio_mayorista: Optional[float] = None
    stock_minimo: float = 0

class ProductoUpdate(BaseModel):
    nombre: Optional[str] = None
    precio_unitario: Optional[float] = None
    precio_mayorista: Optional[float] = None
    stock_minimo: Optional[float] = None
    activo: Optional[bool] = None

class InventarioRead(BaseModel):
    id: int
    producto_id: int
    estado: str
    cantidad: float

    class Config:
        from_attributes = True

class ProductoRead(BaseModel):
    id: int
    nombre: str
    receta_id: int
    precio_unitario: float
    precio_mayorista: Optional[float]
    stock_minimo: float
    activo: bool
    inventarios: list[InventarioRead] = []

    class Config:
        from_attributes = True

# ==================== PRODUCTOS ====================

@router.get("/productos", response_model=list[ProductoRead])
def get_productos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Obtener todos los productos finales"""
    return db.query(Producto).filter(Producto.activo == True).offset(skip).limit(limit).all()

@router.post("/productos", response_model=ProductoRead)
def create_producto(data: ProductoCreate, db: Session = Depends(get_db)):
    """Crear producto final"""
    # Verificar que receta existe
    receta = db.query(Receta).filter(Receta.id == data.receta_id).first()
    if not receta:
        raise HTTPException(status_code=400, detail="Receta no encontrada")
    
    # Crear producto
    producto = Producto(**data.dict())
    db.add(producto)
    db.flush()
    
    # Crear inventarios para los 3 estados
    for estado in ["crudo", "cocido", "congelado"]:
        inv = InventarioProductoPorEstado(
            producto_id=producto.id,
            estado=estado,
            cantidad=0.0
        )
        db.add(inv)
    
    db.commit()
    db.refresh(producto)
    return producto

@router.get("/productos/{id}", response_model=ProductoRead)
def get_producto(id: int, db: Session = Depends(get_db)):
    """Obtener producto por ID"""
    producto = db.query(Producto).filter(Producto.id == id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return producto

@router.put("/productos/{id}", response_model=ProductoRead)
def update_producto(id: int, data: ProductoUpdate, db: Session = Depends(get_db)):
    """Actualizar producto"""
    producto = db.query(Producto).filter(Producto.id == id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    for key, value in data.dict(exclude_unset=True).items():
        setattr(producto, key, value)
    
    db.commit()
    db.refresh(producto)
    return producto

@router.delete("/productos/{id}")
def delete_producto(id: int, db: Session = Depends(get_db)):
    """Eliminar producto (soft delete)"""
    producto = db.query(Producto).filter(Producto.id == id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    producto.activo = False
    db.commit()
    return {"message": "Producto eliminado"}

# ==================== INVENTARIO ====================

@router.get("/inventario/productos")
def get_inventario_productos(db: Session = Depends(get_db)):
    """Obtener inventario actual de todos los productos"""
    productos = db.query(Producto).filter(Producto.activo == True).all()
    
    resultado = []
    for producto in productos:
        inventarios = db.query(InventarioProductoPorEstado).filter(
            InventarioProductoPorEstado.producto_id == producto.id
        ).all()
        
        resultado.append({
            "producto_id": producto.id,
            "producto_nombre": producto.nombre,
            "precio_unitario": producto.precio_unitario,
            "inventarios": [
                {"estado": inv.estado, "cantidad": inv.cantidad}
                for inv in inventarios
            ]
        })
    
    return resultado

@router.get("/inventario/productos/{id}")
def get_inventario_producto(id: int, db: Session = Depends(get_db)):
    """Obtener inventario de un producto específico"""
    producto = db.query(Producto).filter(Producto.id == id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    inventarios = db.query(InventarioProductoPorEstado).filter(
        InventarioProductoPorEstado.producto_id == id
    ).all()
    
    return {
        "producto_id": producto.id,
        "producto_nombre": producto.nombre,
        "precio_unitario": producto.precio_unitario,
        "inventarios": [
            {"estado": inv.estado, "cantidad": inv.cantidad}
            for inv in inventarios
        ]
    }

@router.get("/inventario/bajo-stock")
def get_bajo_stock(db: Session = Depends(get_db)):
    """Obtener productos con stock bajo"""
    productos = db.query(Producto).filter(Producto.activo == True).all()
    
    bajo_stock = []
    for producto in productos:
        total_stock = db.query(
            func.sum(InventarioProductoPorEstado.cantidad)
        ).filter(
            InventarioProductoPorEstado.producto_id == producto.id
        ).scalar() or 0
        
        if total_stock < producto.stock_minimo:
            bajo_stock.append({
                "producto_id": producto.id,
                "producto_nombre": producto.nombre,
                "stock_actual": total_stock,
                "stock_minimo": producto.stock_minimo,
                "diferencia": producto.stock_minimo - total_stock
            })
    
    return bajo_stock

from sqlalchemy import func