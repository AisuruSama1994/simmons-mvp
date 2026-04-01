from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

# ==================== GRUPO 7: AUDITORÍA ====================

class MovimientoInventario(Base):
    """Movimientos de inventario (entrada, salida, ajuste)"""
    __tablename__ = "movimientos_inventario"
    
    id = Column(Integer, primary_key=True, index=True)
    tipo_movimiento = Column(String(50), nullable=False)  # entrada, salida, ajuste, produccion, venta
    producto_materia_prima_id = Column(Integer, ForeignKey("productos_materia_prima.id"), nullable=True)
    lote_materia_prima_id = Column(Integer, ForeignKey("lotes_materia_prima.id"), nullable=True)
    cantidad = Column(Float, nullable=False)
    cantidad_anterior = Column(Float, nullable=True)
    cantidad_posterior = Column(Float, nullable=True)
    razon = Column(String(255), nullable=True)
    referencia = Column(String(100), nullable=True)  # numero de venta, orden, etc
    fecha = Column(DateTime, default=datetime.utcnow, index=True)
    realizado_por_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    
    producto_materia_prima = relationship("ProductoMateriaPrima", foreign_keys=[producto_materia_prima_id])
    lote_materia_prima = relationship("LoteMateriaPrima", back_populates="movimientos")
    realizado_por = relationship("Usuario")

class AuditoriaCambios(Base):
    """Log de auditoría de cambios en el sistema"""
    __tablename__ = "auditoria_cambios"
    
    id = Column(Integer, primary_key=True, index=True)
    tabla = Column(String(100), nullable=False)
    registro_id = Column(Integer, nullable=False)
    tipo_cambio = Column(String(50), nullable=False)  # INSERT, UPDATE, DELETE
    datos_anteriores = Column(Text, nullable=True)  # JSON
    datos_nuevos = Column(Text, nullable=True)      # JSON
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    direccion_ip = Column(String(50), nullable=True)
    fecha = Column(DateTime, default=datetime.utcnow, index=True)
    
    usuario = relationship("Usuario")