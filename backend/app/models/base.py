from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

# ==================== GRUPO 1: BASE ====================

class Rol(Base):
    """Roles de usuarios (admin, gerente, panadero, barista, cajero)"""
    __tablename__ = "roles"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), unique=True, nullable=False)
    descripcion = Column(String(255), nullable=True)
    
    usuarios = relationship("Usuario", back_populates="rol")

class Usuario(Base):
    """Usuarios del sistema"""
    __tablename__ = "usuarios"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    rol_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    sucursal_id = Column(Integer, nullable=True)
    activo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    rol = relationship("Rol", back_populates="usuarios")

class CategoriaMateriaPrima(Base):
    """Categorías de materia prima (harinas, azúcares, levaduras, etc)"""
    __tablename__ = "categorias_materia_prima"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), unique=True, nullable=False)
    descripcion = Column(String(255), nullable=True)
    
    productos_materia_prima = relationship("ProductoMateriaPrima", back_populates="categoria")