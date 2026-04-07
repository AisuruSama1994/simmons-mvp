from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from app.models.base import CategoriaMateriaPrima
from app.models.materia_prima import (
    UnidadMedida, Proveedor, ProductoMateriaPrima, LoteMateriaPrima
)
from app.schemas.materia_prima import (
    CategoriaMateriaPrimaCreate, CategoriaMateriaPrimaRead,
    UnidadMedidaCreate, UnidadMedidaRead,
    ProveedorCreate, ProveedorUpdate, ProveedorRead,
    ProductoMateriaPrimaCreate, ProductoMateriaPrimaUpdate, ProductoMateriaPrimaRead,
    LoteMateriaPrimaCreate, LoteMateriaPrimaUpdate, LoteMateriaPrimaRead,
)

router = APIRouter(prefix="/api/v1", tags=["materia-prima"])

# ==================== CATEGORÍAS ====================

@router.get("/categorias-materia-prima", response_model=list[CategoriaMateriaPrimaRead])
def get_categorias(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(CategoriaMateriaPrima).offset(skip).limit(limit).all()

@router.post("/categorias-materia-prima", response_model=CategoriaMateriaPrimaRead)
def create_categoria(data: CategoriaMateriaPrimaCreate, db: Session = Depends(get_db)):
    if db.query(CategoriaMateriaPrima).filter(CategoriaMateriaPrima.nombre == data.nombre).first():
        raise HTTPException(status_code=400, detail="Categoría ya existe")
    categoria = CategoriaMateriaPrima(**data.dict())
    db.add(categoria)
    db.commit()
    db.refresh(categoria)
    return categoria

@router.get("/categorias-materia-prima/{id}", response_model=CategoriaMateriaPrimaRead)
def get_categoria(id: int, db: Session = Depends(get_db)):
    categoria = db.query(CategoriaMateriaPrima).filter(CategoriaMateriaPrima.id == id).first()
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    return categoria

# ==================== UNIDADES DE MEDIDA ====================

@router.get("/unidades-medida", response_model=list[UnidadMedidaRead])
def get_unidades(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(UnidadMedida).offset(skip).limit(limit).all()

@router.post("/unidades-medida", response_model=UnidadMedidaRead)
def create_unidad(data: UnidadMedidaCreate, db: Session = Depends(get_db)):
    if db.query(UnidadMedida).filter(UnidadMedida.nombre == data.nombre).first():
        raise HTTPException(status_code=400, detail="Unidad ya existe")
    unidad = UnidadMedida(**data.dict())
    db.add(unidad)
    db.commit()
    db.refresh(unidad)
    return unidad

# ==================== PROVEEDORES ====================

@router.get("/proveedores", response_model=list[ProveedorRead])
def get_proveedores(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Proveedor).filter(Proveedor.activo == True).offset(skip).limit(limit).all()

@router.post("/proveedores", response_model=ProveedorRead)
def create_proveedor(data: ProveedorCreate, db: Session = Depends(get_db)):
    proveedor = Proveedor(**data.dict())
    db.add(proveedor)
    db.commit()
    db.refresh(proveedor)
    return proveedor

@router.get("/proveedores/{id}", response_model=ProveedorRead)
def get_proveedor(id: int, db: Session = Depends(get_db)):
    proveedor = db.query(Proveedor).filter(Proveedor.id == id).first()
    if not proveedor:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")
    return proveedor

@router.put("/proveedores/{id}", response_model=ProveedorRead)
def update_proveedor(id: int, data: ProveedorUpdate, db: Session = Depends(get_db)):
    proveedor = db.query(Proveedor).filter(Proveedor.id == id).first()
    if not proveedor:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")
    for key, value in data.dict(exclude_unset=True).items():
        setattr(proveedor, key, value)
    db.commit()
    db.refresh(proveedor)
    return proveedor

# ==================== PRODUCTOS DE MATERIA PRIMA ====================

@router.get("/materia-prima", response_model=list[ProductoMateriaPrimaRead])
def get_materia_prima(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(ProductoMateriaPrima).filter(ProductoMateriaPrima.activo == True).offset(skip).limit(limit).all()

@router.post("/materia-prima", response_model=ProductoMateriaPrimaRead)
def create_materia_prima(data: ProductoMateriaPrimaCreate, db: Session = Depends(get_db)):
    # Validar categoría solo si se proporcionó
    if data.categoria_id is not None:
        if not db.query(CategoriaMateriaPrima).filter(CategoriaMateriaPrima.id == data.categoria_id).first():
            raise HTTPException(status_code=400, detail="Categoría no encontrada")

    # Validar unidad solo si se proporcionó
    if data.unidad_medida_id is not None:
        if not db.query(UnidadMedida).filter(UnidadMedida.id == data.unidad_medida_id).first():
            raise HTTPException(status_code=400, detail="Unidad no encontrada")

    producto = ProductoMateriaPrima(**data.dict())
    db.add(producto)
    db.commit()
    db.refresh(producto)
    return producto

@router.get("/materia-prima/{id}", response_model=ProductoMateriaPrimaRead)
def get_materia_prima_by_id(id: int, db: Session = Depends(get_db)):
    producto = db.query(ProductoMateriaPrima).filter(ProductoMateriaPrima.id == id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return producto

@router.put("/materia-prima/{id}", response_model=ProductoMateriaPrimaRead)
def update_materia_prima(id: int, data: ProductoMateriaPrimaUpdate, db: Session = Depends(get_db)):
    producto = db.query(ProductoMateriaPrima).filter(ProductoMateriaPrima.id == id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    for key, value in data.dict(exclude_unset=True).items():
        setattr(producto, key, value)
    db.commit()
    db.refresh(producto)
    return producto

# ==================== LOTES DE MATERIA PRIMA ====================

@router.get("/lotes-materia-prima", response_model=list[LoteMateriaPrimaRead])
def get_lotes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(LoteMateriaPrima).offset(skip).limit(limit).all()

@router.get("/lotes-materia-prima/activos", response_model=list[LoteMateriaPrimaRead])
def get_lotes_activos(db: Session = Depends(get_db)):
    return db.query(LoteMateriaPrima).filter(LoteMateriaPrima.activo == True).all()

@router.post("/lotes-materia-prima", response_model=LoteMateriaPrimaRead)
def create_lote(data: LoteMateriaPrimaCreate, db: Session = Depends(get_db)):
    lote_data = data.dict()
    lote_data['cantidad_actual'] = data.cantidad_inicial
    lote = LoteMateriaPrima(**lote_data)
    db.add(lote)
    db.commit()
    db.refresh(lote)
    return lote

@router.get("/lotes-materia-prima/{id}", response_model=LoteMateriaPrimaRead)
def get_lote(id: int, db: Session = Depends(get_db)):
    lote = db.query(LoteMateriaPrima).filter(LoteMateriaPrima.id == id).first()
    if not lote:
        raise HTTPException(status_code=404, detail="Lote no encontrado")
    return lote

@router.put("/lotes-materia-prima/{id}", response_model=LoteMateriaPrimaRead)
def update_lote(id: int, data: LoteMateriaPrimaUpdate, db: Session = Depends(get_db)):
    lote = db.query(LoteMateriaPrima).filter(LoteMateriaPrima.id == id).first()
    if not lote:
        raise HTTPException(status_code=404, detail="Lote no encontrado")
    for key, value in data.dict(exclude_unset=True).items():
        setattr(lote, key, value)
    db.commit()
    db.refresh(lote)
    return lote
# Agregar estos endpoints al final de materia_prima.py
 
# ── DELETE Categoría ──────────────────────────────────────────
 
@router.delete("/categorias-materia-prima/{id}", status_code=204)
def delete_categoria(id: int, db: Session = Depends(get_db)):
    categoria = db.query(CategoriaMateriaPrima).filter(CategoriaMateriaPrima.id == id).first()
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    db.delete(categoria)
    db.commit()
 
# ── DELETE Materia Prima (borrado lógico) ─────────────────────
 
@router.delete("/materia-prima/{id}", status_code=204)
def delete_materia_prima(id: int, db: Session = Depends(get_db)):
    producto = db.query(ProductoMateriaPrima).filter(ProductoMateriaPrima.id == id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    producto.activo = False
    db.commit()
 
# ── DELETE Proveedor (borrado lógico) ─────────────────────────
 
@router.delete("/proveedores/{id}", status_code=204)
def delete_proveedor(id: int, db: Session = Depends(get_db)):
    proveedor = db.query(Proveedor).filter(Proveedor.id == id).first()
    if not proveedor:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")
    proveedor.activo = False
    db.commit()
 
# ── DELETE Lote (borrado lógico) ──────────────────────────────
 
@router.delete("/lotes-materia-prima/{id}", status_code=204)
def delete_lote(id: int, db: Session = Depends(get_db)):
    lote = db.query(LoteMateriaPrima).filter(LoteMateriaPrima.id == id).first()
    if not lote:
        raise HTTPException(status_code=404, detail="Lote no encontrado")
    lote.activo = False
    db.commit()