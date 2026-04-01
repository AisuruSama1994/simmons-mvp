# Importar todos los modelos para que SQLAlchemy los reconozca
from models_base import Rol, Usuario, CategoriaMateriaPrima
from models_materia_prima import (
    UnidadMedida,
    ConversionUnidades,
    Proveedor,
    ProductoMateriaPrima,
    LoteMateriaPrima,
)
from models_recetas_productos import (
    Receta,
    RecetaIngrediente,
    Producto,
    InventarioProductoPorEstado,
    LoteProducto,
)
from models_produccion import (
    OrdenProduccion,
    TransformacionProduccion,
)
from models_ventas import Venta, VentaItem
from models_auditoria import MovimientoInventario, AuditoriaCambios

__all__ = [
    # Base
    "Rol",
    "Usuario",
    "CategoriaMateriaPrima",
    # Materia Prima
    "UnidadMedida",
    "ConversionUnidades",
    "Proveedor",
    "ProductoMateriaPrima",
    "LoteMateriaPrima",
    # Recetas y Productos
    "Receta",
    "RecetaIngrediente",
    "Producto",
    "InventarioProductoPorEstado",
    "LoteProducto",
    # Producción
    "OrdenProduccion",
    "TransformacionProduccion",
    # Ventas
    "Venta",
    "VentaItem",
    # Auditoría
    "MovimientoInventario",
    "AuditoriaCambios",
]