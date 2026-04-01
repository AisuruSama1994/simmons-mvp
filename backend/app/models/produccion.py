from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Table, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

# Tabla de relación muchos-a-muchos para órdenes y lotes usados
orden_lotes_materia_prima = Table(
    'orden_produccion_lotes_usados',
    Base.metadata,
    Column('orden_id', Integer, ForeignKey('ordenes_produccion.id'), primary_key=True),
    Column('lote_id', Integer, ForeignKey('lotes_materia_prima.id'), primary_key=True),
    Column('cantidad_usada', Float, nullable=False),
)

# ==================== GRUPO 5: PRODUCCIÓN ====================

class OrdenProduccion(Base):
    """Órdenes de producción"""
    __tablename__ = "ordenes_produccion"
    
    id = Column(Integer, primary_key=True, index=True)
    receta_id = Column(Integer, ForeignKey("recetas.id"), nullable=False)
    cantidad_objetivo = Column(Float, nullable=False)
    cantidad_producida = Column(Float, default=0)
    estado = Column(String(50), default="pendiente")  # pendiente, en_progreso, completada, cancelada
    fecha_inicio = Column(DateTime, nullable=True)
    fecha_finalizacion = Column(DateTime, nullable=True)
    notas = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    
    receta = relationship("Receta", back_populates="ordenes")
    transformaciones = relationship("TransformacionProduccion", back_populates="orden", cascade="all, delete-orphan")
    lotes_materia_prima = relationship(
        "LoteMateriaPrima",
        secondary=orden_lotes_materia_prima,
        backref="ordenes"
    )

class TransformacionProduccion(Base):
    """Transformaciones durante la producción (cocción, congelación, etc)"""
    __tablename__ = "transformacion_produccion"
    
    id = Column(Integer, primary_key=True, index=True)
    orden_id = Column(Integer, ForeignKey("ordenes_produccion.id"), nullable=False)
    lote_destino_id = Column(Integer, ForeignKey("lotes_productos.id"), nullable=False)
    tipo_transformacion = Column(String(50), nullable=False)  # coccion, congelacion, empaquetado
    cantidad = Column(Float, nullable=False)
    estado_anterior = Column(String(50), nullable=False)
    estado_nuevo = Column(String(50), nullable=False)
    fecha = Column(DateTime, default=datetime.utcnow)
    notas = Column(Text, nullable=True)
    realizado_por_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    
    orden = relationship("OrdenProduccion", back_populates="transformaciones")
    lote_destino = relationship("LoteProducto", back_populates="transformaciones")