from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

# ==================== GRUPO 6: VENTAS ====================

class Venta(Base):
    """Ventas realizadas"""
    __tablename__ = "ventas"
    
    id = Column(Integer, primary_key=True, index=True)
    numero_venta = Column(String(50), unique=True, nullable=False)
    fecha = Column(DateTime, default=datetime.utcnow, index=True)
    cliente_nombre = Column(String(100), nullable=True)
    cliente_email = Column(String(100), nullable=True)
    cliente_telefono = Column(String(20), nullable=True)
    monto_total = Column(Float, nullable=False, default=0)
    descuento = Column(Float, default=0)
    monto_final = Column(Float, nullable=False)
    metodo_pago = Column(String(50), nullable=True)  # efectivo, tarjeta, transferencia
    tipo_venta = Column(String(50), default="mostrador")  # mostrador, delivery, online
    estado = Column(String(50), default="completada")  # completada, cancelada, devolucion
    notas = Column(Text, nullable=True)
    realizado_por_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    items = relationship("VentaItem", back_populates="venta", cascade="all, delete-orphan")
    cajero = relationship("Usuario", foreign_keys=[realizado_por_id])

class VentaItem(Base):
    """Items de una venta"""
    __tablename__ = "venta_items"
    
    id = Column(Integer, primary_key=True, index=True)
    venta_id = Column(Integer, ForeignKey("ventas.id"), nullable=False)
    producto_id = Column(Integer, ForeignKey("productos.id"), nullable=False)
    cantidad = Column(Float, nullable=False)
    precio_unitario = Column(Float, nullable=False)
    subtotal = Column(Float, nullable=False)
    descuento_item = Column(Float, default=0)
    
    venta = relationship("Venta", back_populates="items")
    producto = relationship("Producto", back_populates="venta_items")