from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

# ==================== GRUPO 3: RECETAS ====================

class Receta(Base):
    """Recetas de productos finales (medialunas, pan, etc)"""
    __tablename__ = "recetas"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False, unique=True)
    descripcion = Column(Text, nullable=True)
    tiempo_preparacion = Column(Integer, nullable=True)  # minutos
    tiempo_coccion = Column(Integer, nullable=True)      # minutos
    rendimiento = Column(Float, nullable=False)          # cantidad producida
    unidad_rendimiento_id = Column(Integer, ForeignKey("unidades_medida.id"), nullable=False)
    costo_estimado = Column(Float, nullable=True)
    activo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    unidad_rendimiento = relationship("UnidadMedida", foreign_keys=[unidad_rendimiento_id])
    ingredientes = relationship("RecetaIngrediente", back_populates="receta", cascade="all, delete-orphan")
    productos = relationship("Producto", back_populates="receta")
    ordenes = relationship("OrdenProduccion", back_populates="receta")

class RecetaIngrediente(Base):
    """Ingredientes de una receta"""
    __tablename__ = "receta_ingredientes"
    
    id = Column(Integer, primary_key=True, index=True)
    receta_id = Column(Integer, ForeignKey("recetas.id"), nullable=False)
    producto_materia_prima_id = Column(Integer, ForeignKey("productos_materia_prima.id"), nullable=False)
    cantidad = Column(Float, nullable=False)
    unidad_medida_id = Column(Integer, ForeignKey("unidades_medida.id"), nullable=False)
    
    receta = relationship("Receta", back_populates="ingredientes")
    producto_materia_prima = relationship("ProductoMateriaPrima")
    unidad_medida = relationship("UnidadMedida")

# ==================== GRUPO 4: INVENTARIO DE PRODUCTOS ====================

class Producto(Base):
    """Productos finales (medialunas, pan, bizcochos, etc)"""
    __tablename__ = "productos"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False, unique=True)
    receta_id = Column(Integer, ForeignKey("recetas.id"), nullable=False)
    precio_unitario = Column(Float, nullable=False)
    precio_mayorista = Column(Float, nullable=True)
    stock_minimo = Column(Float, default=0)
    activo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    receta = relationship("Receta", back_populates="productos")
    inventarios = relationship("InventarioProductoPorEstado", back_populates="producto", cascade="all, delete-orphan")
    lotes = relationship("LoteProducto", back_populates="producto", cascade="all, delete-orphan")
    venta_items = relationship("VentaItem", back_populates="producto")

class InventarioProductoPorEstado(Base):
    """Inventario de productos por estado (crudo, cocido, congelado)"""
    __tablename__ = "inventario_productos_por_estado"
    
    id = Column(Integer, primary_key=True, index=True)
    producto_id = Column(Integer, ForeignKey("productos.id"), nullable=False)
    estado = Column(String(50), nullable=False)  # crudo, cocido, congelado
    cantidad = Column(Float, default=0)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    producto = relationship("Producto", back_populates="inventarios")

class LoteProducto(Base):
    """Lotes de productos finales"""
    __tablename__ = "lotes_productos"
    
    id = Column(Integer, primary_key=True, index=True)
    producto_id = Column(Integer, ForeignKey("productos.id"), nullable=False)
    cantidad = Column(Float, nullable=False)
    estado = Column(String(50), nullable=False)  # crudo, cocido, congelado
    fecha_produccion = Column(DateTime, default=datetime.utcnow)
    fecha_vencimiento = Column(DateTime, nullable=True)
    activo = Column(Boolean, default=True)
    
    producto = relationship("Producto", back_populates="lotes")
    transformaciones = relationship("TransformacionProduccion", back_populates="lote_destino", foreign_keys="TransformacionProduccion.lote_destino_id")