from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class UnidadMedida(Base):
    __tablename__ = "unidades_medida"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), unique=True, nullable=False)
    abreviacion = Column(String(10), unique=True, nullable=False)
    tipo = Column(String(20), nullable=False)  # peso, volumen, cantidad
    conversiones_from = relationship("ConversionUnidades", foreign_keys="ConversionUnidades.unidad_origen_id", back_populates="unidad_origen")
    conversiones_to = relationship("ConversionUnidades", foreign_keys="ConversionUnidades.unidad_destino_id", back_populates="unidad_destino")
    productos_materia_prima = relationship("ProductoMateriaPrima", back_populates="unidad_medida")

class ConversionUnidades(Base):
    __tablename__ = "conversiones_unidades"
    id = Column(Integer, primary_key=True, index=True)
    unidad_origen_id = Column(Integer, ForeignKey("unidades_medida.id"), nullable=False)
    unidad_destino_id = Column(Integer, ForeignKey("unidades_medida.id"), nullable=False)
    factor = Column(Float, nullable=False)
    unidad_origen = relationship("UnidadMedida", foreign_keys=[unidad_origen_id], back_populates="conversiones_from")
    unidad_destino = relationship("UnidadMedida", foreign_keys=[unidad_destino_id], back_populates="conversiones_to")

class Proveedor(Base):
    __tablename__ = "proveedores"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    domicilio = Column(String(255), nullable=True)
    telefono = Column(String(20), nullable=True)
    celular = Column(String(20), nullable=True)
    whatsapp = Column(String(20), nullable=True)
    email = Column(String(100), nullable=True)
    instagram = Column(String(100), nullable=True)
    facebook = Column(String(100), nullable=True)
    website = Column(String(255), nullable=True)
    notas = Column(Text, nullable=True)
    activo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    lotes_materia_prima = relationship("LoteMateriaPrima", back_populates="proveedor")
    productos_asociados = relationship("ProductoProveedorPrecio", back_populates="proveedor")

class ProductoMateriaPrima(Base):
    __tablename__ = "productos_materia_prima"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    marca = Column(String(100), nullable=True)
    presentacion = Column(String(100), nullable=True)
    codigo_barras = Column(String(50), nullable=True, index=True)
    imagen_url = Column(String(255), nullable=True)
    descripcion = Column(Text, nullable=True)
    categoria_id = Column(Integer, ForeignKey("categorias_materia_prima.id"), nullable=False)
    unidad_medida_id = Column(Integer, ForeignKey("unidades_medida.id"), nullable=False)
    stock_minimo = Column(Float, default=0)
    activo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    categoria = relationship("CategoriaMateriaPrima", back_populates="productos_materia_prima")
    unidad_medida = relationship("UnidadMedida", back_populates="productos_materia_prima")
    lotes = relationship("LoteMateriaPrima", back_populates="producto")
    proveedores_asociados = relationship("ProductoProveedorPrecio", back_populates="producto")

class ProductoProveedorPrecio(Base):
    __tablename__ = "producto_proveedor_precio"
    id = Column(Integer, primary_key=True, index=True)
    producto_materia_prima_id = Column(Integer, ForeignKey("productos_materia_prima.id"), nullable=False)
    proveedor_id = Column(Integer, ForeignKey("proveedores.id"), nullable=False)
    precio_referencia = Column(Float, nullable=True)
    fecha_ultima_compra = Column(DateTime, nullable=True)
    activo = Column(Boolean, default=True)
    notas = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    producto = relationship("ProductoMateriaPrima", back_populates="proveedores_asociados")
    proveedor = relationship("Proveedor", back_populates="productos_asociados")
    historial_precios = relationship("HistorialPrecioProveedor", back_populates="producto_proveedor")

class HistorialPrecioProveedor(Base):
    __tablename__ = "historial_precio_proveedor"
    id = Column(Integer, primary_key=True, index=True)
    producto_proveedor_id = Column(Integer, ForeignKey("producto_proveedor_precio.id"), nullable=False)
    precio_unitario = Column(Float, nullable=False)
    cantidad_comprada = Column(Float, nullable=True)
    fecha = Column(DateTime, default=datetime.utcnow, index=True)
    lote_id = Column(Integer, ForeignKey("lotes_materia_prima.id"), nullable=True)
    notas = Column(Text, nullable=True)
    producto_proveedor = relationship("ProductoProveedorPrecio", back_populates="historial_precios")
    lote = relationship("LoteMateriaPrima", back_populates="historial_precios")

class LoteMateriaPrima(Base):
    __tablename__ = "lotes_materia_prima"
    id = Column(Integer, primary_key=True, index=True)
    producto_id = Column(Integer, ForeignKey("productos_materia_prima.id"), nullable=False)
    proveedor_id = Column(Integer, ForeignKey("proveedores.id"), nullable=False)
    cantidad_inicial = Column(Float, nullable=False)
    cantidad_actual = Column(Float, nullable=False)
    precio_total = Column(Float, nullable=False)
    precio_unitario = Column(Float, nullable=True)
    fecha_compra = Column(DateTime, default=datetime.utcnow)
    fecha_vencimiento = Column(DateTime, nullable=True)
    lote_numero = Column(String(50), nullable=True)
    codigo_barras_lote = Column(String(50), nullable=True)
    activo = Column(Boolean, default=True)
    producto = relationship("ProductoMateriaPrima", back_populates="lotes")
    proveedor = relationship("Proveedor", back_populates="lotes_materia_prima")
    movimientos = relationship("MovimientoInventario", back_populates="lote_materia_prima")
    historial_precios = relationship("HistorialPrecioProveedor", back_populates="lote")
