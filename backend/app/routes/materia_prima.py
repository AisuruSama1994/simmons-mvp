from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, text
from database import get_db
from datetime import datetime, timedelta
from typing import Optional
from pydantic import BaseModel

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
    StockTotalMateriaPrimaRead, DetalleLotsMateriaPrimaRead
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

@router.delete("/categorias-materia-prima/{id}", status_code=204)
def delete_categoria(id: int, db: Session = Depends(get_db)):
    categoria = db.query(CategoriaMateriaPrima).filter(CategoriaMateriaPrima.id == id).first()
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    db.delete(categoria)
    db.commit()

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

@router.delete("/proveedores/{id}", status_code=204)
def delete_proveedor(id: int, db: Session = Depends(get_db)):
    proveedor = db.query(Proveedor).filter(Proveedor.id == id).first()
    if not proveedor:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")
    proveedor.activo = False
    db.commit()

# ==================== PRODUCTOS DE MATERIA PRIMA ====================

@router.get("/materia-prima", response_model=list[ProductoMateriaPrimaRead])
def get_materia_prima(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(ProductoMateriaPrima).filter(ProductoMateriaPrima.activo == True).offset(skip).limit(limit).all()

@router.post("/materia-prima", response_model=ProductoMateriaPrimaRead)
def create_materia_prima(data: ProductoMateriaPrimaCreate, db: Session = Depends(get_db)):
    if data.categoria_id is not None:
        if not db.query(CategoriaMateriaPrima).filter(CategoriaMateriaPrima.id == data.categoria_id).first():
            raise HTTPException(status_code=400, detail="Categoría no encontrada")

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

@router.delete("/materia-prima/{id}", status_code=204)
def delete_materia_prima(id: int, db: Session = Depends(get_db)):
    producto = db.query(ProductoMateriaPrima).filter(ProductoMateriaPrima.id == id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    producto.activo = False
    db.commit()

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

@router.delete("/lotes-materia-prima/{id}", status_code=204)
def delete_lote(id: int, db: Session = Depends(get_db)):
    lote = db.query(LoteMateriaPrima).filter(LoteMateriaPrima.id == id).first()
    if not lote:
        raise HTTPException(status_code=404, detail="Lote no encontrado")
    lote.activo = False
    db.commit()

# ==================== STOCK TOTAL (FASE 2 - NUEVOS ENDPOINTS) ====================

@router.get("/stock-total", response_model=list[StockTotalMateriaPrimaRead])
def get_stock_total(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Obtener el stock total de TODAS las materias primas."""
    query = text("""
        SELECT 
            producto_id,
            producto_nombre,
            unidad_medida_nombre,
            unidad_abreviacion,
            stock_total,
            cantidad_lotes,
            stock_minimo,
            estado_stock
        FROM stock_total_materia_prima
        ORDER BY producto_nombre
        LIMIT :limit OFFSET :skip
    """)
    
    result = db.execute(query, {"limit": limit, "skip": skip}).fetchall()
    
    return [
        {
            "producto_id": r[0],
            "producto_nombre": r[1],
            "unidad_medida_nombre": r[2],
            "unidad_abreviacion": r[3],
            "stock_total": r[4],
            "cantidad_lotes": r[5],
            "stock_minimo": r[6],
            "estado_stock": r[7]
        }
        for r in result
    ]

@router.get("/stock-total/{producto_id}", response_model=StockTotalMateriaPrimaRead)
def get_stock_total_by_product(producto_id: int, db: Session = Depends(get_db)):
    """Obtener stock total de una materia prima específica."""
    query = text("""
        SELECT 
            producto_id,
            producto_nombre,
            unidad_medida_nombre,
            unidad_abreviacion,
            stock_total,
            cantidad_lotes,
            stock_minimo,
            estado_stock
        FROM stock_total_materia_prima
        WHERE producto_id = :producto_id
    """)
    
    result = db.execute(query, {"producto_id": producto_id}).fetchone()
    
    if not result:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    return {
        "producto_id": result[0],
        "producto_nombre": result[1],
        "unidad_medida_nombre": result[2],
        "unidad_abreviacion": result[3],
        "stock_total": result[4],
        "cantidad_lotes": result[5],
        "stock_minimo": result[6],
        "estado_stock": result[7]
    }

@router.get("/lotes-por-producto/{producto_id}", response_model=list[DetalleLotsMateriaPrimaRead])
def get_lotes_por_producto(producto_id: int, db: Session = Depends(get_db)):
    """Obtener todos los lotes de una materia prima específica."""
    query = text("""
        SELECT 
            lote_id,
            producto_nombre,
            proveedor_nombre,
            cantidad_presentacion,
            unidad_presentacion,
            peso_unitario,
            unidad_medida,
            unidad_abreviacion,
            cantidad_actual,
            lote_numero,
            codigo_barras_lote,
            fecha_compra,
            fecha_vencimiento,
            precio_unitario,
            precio_total,
            activo,
            estado_vencimiento
        FROM detalle_lotes_materia_prima
        WHERE producto_nombre = (SELECT nombre FROM productos_materia_prima WHERE id = :producto_id)
        ORDER BY fecha_compra DESC
    """)
    
    result = db.execute(query, {"producto_id": producto_id}).fetchall()
    
    if not result:
        raise HTTPException(status_code=404, detail="No hay lotes para este producto")
    
    return [
        {
            "lote_id": r[0],
            "producto_nombre": r[1],
            "proveedor_nombre": r[2],
            "cantidad_presentacion": r[3],
            "unidad_presentacion": r[4],
            "peso_unitario": r[5],
            "unidad_medida": r[6],
            "unidad_abreviacion": r[7],
            "cantidad_actual": r[8],
            "lote_numero": r[9],
            "codigo_barras_lote": r[10],
            "fecha_compra": r[11],
            "fecha_vencimiento": r[12],
            "precio_unitario": r[13],
            "precio_total": r[14],
            "activo": r[15],
            "estado_vencimiento": r[16]
        }
        for r in result
    ]

@router.get("/alertas-stock")
def get_alertas_stock(db: Session = Depends(get_db)):
    """Obtener lista de materias primas con stock bajo."""
    query = text("""
        SELECT 
            producto_id,
            producto_nombre,
            stock_total as stock_actual,
            stock_minimo,
            unidad_abreviacion as unidad_medida,
            estado_stock
        FROM stock_total_materia_prima
        WHERE estado_stock IN ('BAJO', 'ALERTA')
        ORDER BY producto_nombre
    """)
    
    result = db.execute(query).fetchall()
    
    alertas = []
    for r in result:
        diferencia = r[2] - r[3]
        alertas.append({
            "producto_id": r[0],
            "producto_nombre": r[1],
            "stock_actual": r[2],
            "stock_minimo": r[3],
            "unidad_medida": r[4],
            "diferencia": diferencia,
            "estado": r[5]
        })
    
    return {
        "total_alertas": len(alertas),
        "fecha_consulta": datetime.utcnow(),
        "alertas": alertas
    }

@router.get("/lotes-proximos-vencer")
def get_lotes_proximos_vencer(dias: int = 7, db: Session = Depends(get_db)):
    """Obtener lotes que vencen en los próximos N días."""
    fecha_hasta = datetime.utcnow() + timedelta(days=dias)
    
    lotes_proximos = db.query(LoteMateriaPrima).filter(
        LoteMateriaPrima.fecha_vencimiento != None,
        LoteMateriaPrima.fecha_vencimiento <= fecha_hasta,
        LoteMateriaPrima.activo == True
    ).order_by(LoteMateriaPrima.fecha_vencimiento).all()
    
    lotes_info = []
    for lote in lotes_proximos:
        dias_para_vencer = (lote.fecha_vencimiento.date() - datetime.utcnow().date()).days
        lotes_info.append({
            "lote_id": lote.id,
            "producto_nombre": lote.producto.nombre,
            "proveedor": lote.proveedor.nombre if lote.proveedor else None,
            "cantidad": lote.cantidad_actual,
            "unidad_medida": lote.producto.unidad_medida.abreviacion if lote.producto.unidad_medida else None,
            "fecha_vencimiento": lote.fecha_vencimiento,
            "dias_para_vencer": dias_para_vencer
        })
    
    return {
        "dias_rango": dias,
        "fecha_consulta": datetime.utcnow().date(),
        "total_lotes": len(lotes_info),
        "lotes": lotes_info
    }