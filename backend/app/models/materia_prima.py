from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

# ==================== GRUPO 2: MATERIA PRIMA ====================

class UnidadMedida(Base):
    """Unidades de medida (kg, g, l, ml, unidad)"""
    __tablename__ = "unidades_medida"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), unique=True, nullable=False)
    abreviacion = Column(String(10), unique=True, nullable=False)
    tipo = Column(String(20), nullable=False)  # peso, volumen, cantidad
    
    conversiones_from = relationship("ConversionUnidades", foreign_keys="ConversionUnidades.unidad_origen_id", back_populates="unidad_origen")
    conversiones_to = relationship("ConversionUnidades", foreign_keys="ConversionUnidades.unidad_destino_id", back_populates="unidad_destino")
    productos_materia_prima = relationship("ProductoMateriaPrima", back_populates="unidad_medida")

class ConversionUnidades(Base):
    """Conversiones entre unidades de medida"""
    __tablename__ = "conversiones_unidades"
    
    id = Column(Integer, primary_key=True, index=True)
    unidad_origen_id = Column(Integer, ForeignKey("unidades_medida.id"), nullable=False)
    unidad_destino_id = Column(Integer, ForeignKey("unidades_medida.id"), nullable=False)
    factor = Column(Float, nullable=False)
    
    unidad_origen = relationship("UnidadMedida", foreign_keys=[unidad_origen_id], back_populates="conversiones_from")
    unidad_destino = relationship("UnidadMedida", foreign_keys=[unidad_destino_id], back_populates="conversiones_to")

class Proveedor(Base):
    """Proveedores de materia prima"""
    __tablename__ = "proveedores"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    domicilio = Column(String(255), nullable=True)
    telefono = Column(String(20), nullable=True)
    celular = Column(String(20), nullable=True)
    instagram = Column(String(100), nullable=True)
    email = Column(String(100), nullable=True)
    activo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    lotes_materia_prima = relationship("LoteMateriaPrima", back_populates="proveedor")

class ProductoMateriaPrima(Base):
    """Productos de materia prima (harina, azúcar, levadura, etc)"""
    __tablename__ = "productos_materia_prima"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    categoria_id = Column(Integer, ForeignKey("categorias_materia_prima.id"), nullable=False)
    unidad_medida_id = Column(Integer, ForeignKey("unidades_medida.id"), nullable=False)
    precio_unitario = Column(Float, nullable=True)  # Precio promedio
    stock_minimo = Column(Float, default=0)
    activo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    categoria = relationship("CategoriaMateriaPrima", back_populates="productos_materia_prima")
    unidad_medida = relationship("UnidadMedida", back_populates="productos_materia_prima")
    lotes = relationship("LoteMateriaPrima", back_populates="producto")

class LoteMateriaPrima(Base):
    """Lotes de materia prima (cada compra)"""
    __tablename__ = "lotes_materia_prima"
    
    id = Column(Integer, primary_key=True, index=True)
    producto_id = Column(Integer, ForeignKey("productos_materia_prima.id"), nullable=False)
    proveedor_id = Column(Integer, ForeignKey("proveedores.id"), nullable=False)
    cantidad_inicial = Column(Float, nullable=False)
    cantidad_actual = Column(Float, nullable=False)
    precio_total = Column(Float, nullable=False)
    fecha_compra = Column(DateTime, default=datetime.utcnow)
    fecha_vencimiento = Column(DateTime, nullable=True)
    lote_numero = Column(String(50), nullable=True)
    activo = Column(Boolean, default=True)
    
    producto = relationship("ProductoMateriaPrima", back_populates="lotes")
    proveedor = relationship("Proveedor", back_populates="lotes_materia_prima")
    movimientos = relationship("MovimientoInventario", back_populates="lote_materia_prima")