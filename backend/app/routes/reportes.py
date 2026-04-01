from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from app.models.ventas import Venta, VentaItem
from app.models.produccion import OrdenProduccion
from app.models.recetas_productos import Producto, InventarioProductoPorEstado
from app.models.materia_prima import LoteMateriaPrima
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/v1", tags=["reportes"])

# ==================== DASHBOARD ====================

@router.get("/reportes/dashboard")
def get_dashboard(db: Session = Depends(get_db)):
    """Dashboard principal con KPIs"""
    hoy = datetime.utcnow().date()
    
    # Ventas de hoy
    ventas_hoy = db.query(Venta).filter(
        func.date(Venta.fecha) == hoy
    ).all()
    
    monto_ventas_hoy = sum(v.monto_final for v in ventas_hoy)
    cantidad_ventas_hoy = len(ventas_hoy)
    
    # Ventas del mes
    primer_dia_mes = datetime.utcnow().replace(day=1).date()
    ventas_mes = db.query(Venta).filter(
        func.date(Venta.fecha) >= primer_dia_mes
    ).all()
    
    monto_ventas_mes = sum(v.monto_final for v in ventas_mes)
    
    # Órdenes pendientes
    ordenes_pendientes = db.query(OrdenProduccion).filter(
        OrdenProduccion.estado.in_(["pendiente", "en_progreso"])
    ).all()
    
    # Productos con stock bajo
    productos = db.query(Producto).filter(Producto.activo == True).all()
    bajo_stock = []
    
    for producto in productos:
        total_stock = db.query(
            func.sum(InventarioProductoPorEstado.cantidad)
        ).filter(
            InventarioProductoPorEstado.producto_id == producto.id
        ).scalar() or 0
        
        if total_stock < producto.stock_minimo:
            bajo_stock.append({
                "producto_id": producto.id,
                "nombre": producto.nombre,
                "stock_actual": total_stock,
                "stock_minimo": producto.stock_minimo
            })
    
    # Materia prima próxima a vencer
    manana = (datetime.utcnow() + timedelta(days=1)).date()
    lotes_vencimiento = db.query(LoteMateriaPrima).filter(
        LoteMateriaPrima.activo == True,
        LoteMateriaPrima.fecha_vencimiento <= manana
    ).all()
    
    return {
        "fecha": hoy,
        "kpis": {
            "ventas_hoy": {
                "cantidad": cantidad_ventas_hoy,
                "monto": monto_ventas_hoy,
                "promedio": monto_ventas_hoy / cantidad_ventas_hoy if cantidad_ventas_hoy > 0 else 0
            },
            "ventas_mes": {
                "monto": monto_ventas_mes,
                "cantidad": len(ventas_mes)
            },
            "ordenes_pendientes": len(ordenes_pendientes),
            "productos_bajo_stock": len(bajo_stock),
            "materias_primas_vencer": len(lotes_vencimiento)
        },
        "alertas": {
            "bajo_stock": bajo_stock,
            "vencimiento_proximo": [
                {
                    "lote_id": l.id,
                    "producto": l.producto.nombre,
                    "cantidad": l.cantidad_actual,
                    "vencimiento": l.fecha_vencimiento.date()
                }
                for l in lotes_vencimiento
            ]
        },
        "ordenes_pendientes": [
            {
                "id": o.id,
                "receta": o.receta.nombre,
                "cantidad_objetivo": o.cantidad_objetivo,
                "cantidad_producida": o.cantidad_producida or 0,
                "progreso": ((o.cantidad_producida or 0) / o.cantidad_objetivo * 100) if o.cantidad_objetivo > 0 else 0,
                "estado": o.estado
            }
            for o in ordenes_pendientes[:5]
        ]
    }

# ==================== REPORTES FINANCIEROS ====================

@router.get("/reportes/financiero/diario")
def reporte_financiero_diario(db: Session = Depends(get_db)):
    """Reporte financiero del día"""
    hoy = datetime.utcnow().date()
    
    ventas = db.query(Venta).filter(
        func.date(Venta.fecha) == hoy
    ).all()
    
    total_bruto = sum(v.monto_total for v in ventas)
    descuentos = sum(v.descuento for v in ventas)
    total_neto = sum(v.monto_final for v in ventas)
    
    # Agrupar por método de pago
    por_metodo = {}
    for venta in ventas:
        metodo = venta.metodo_pago or "Sin especificar"
        if metodo not in por_metodo:
            por_metodo[metodo] = {"cantidad": 0, "monto": 0}
        por_metodo[metodo]["cantidad"] += 1
        por_metodo[metodo]["monto"] += venta.monto_final
    
    return {
        "fecha": hoy,
        "resumen": {
            "cantidad_transacciones": len(ventas),
            "monto_bruto": total_bruto,
            "descuentos_totales": descuentos,
            "monto_neto": total_neto,
            "ticket_promedio": total_neto / len(ventas) if ventas else 0
        },
        "por_metodo_pago": por_metodo
    }

@router.get("/reportes/financiero/mensual")
def reporte_financiero_mensual(db: Session = Depends(get_db)):
    """Reporte financiero del mes"""
    primer_dia = datetime.utcnow().replace(day=1).date()
    
    ventas = db.query(Venta).filter(
        func.date(Venta.fecha) >= primer_dia
    ).all()
    
    # Agrupar por día
    por_dia = {}
    for venta in ventas:
        dia = venta.fecha.date()
        if dia not in por_dia:
            por_dia[dia] = {"cantidad": 0, "monto": 0}
        por_dia[dia]["cantidad"] += 1
        por_dia[dia]["monto"] += venta.monto_final
    
    total_mes = sum(v.monto_final for v in ventas)
    
    return {
        "periodo": f"Mes de {datetime.utcnow().strftime('%B %Y')}",
        "resumen": {
            "cantidad_transacciones": len(ventas),
            "monto_total": total_mes,
            "promedio_diario": total_mes / len(por_dia) if por_dia else 0,
            "dias_activos": len(por_dia)
        },
        "detalle_diario": por_dia
    }

# ==================== REPORTES DE INVENTARIO ====================

@router.get("/reportes/inventario/estado")
def reporte_inventario_estado(db: Session = Depends(get_db)):
    """Estado actual del inventario"""
    inventarios = db.query(InventarioProductoPorEstado).all()
    
    por_estado = {}
    for inv in inventarios:
        estado = inv.estado
        if estado not in por_estado:
            por_estado[estado] = {"cantidad": 0, "productos": []}
        
        por_estado[estado]["cantidad"] += inv.cantidad
        por_estado[estado]["productos"].append({
            "producto_id": inv.producto_id,
            "producto": inv.producto.nombre,
            "cantidad": inv.cantidad
        })
    
    return {
        "fecha": datetime.utcnow().date(),
        "por_estado": por_estado,
        "inventario_total": sum(inv.cantidad for inv in inventarios)
    }

@router.get("/reportes/inventario/movimientos")
def reporte_movimientos_inventario(
    dias: int = 7,
    db: Session = Depends(get_db)
):
    """Reporte de movimientos recientes"""
    fecha_desde = datetime.utcnow() - timedelta(days=dias)
    
    # Para este ejemplo, usamos las ventas como movimientos
    ventas_items = db.query(VentaItem).join(Venta).filter(
        Venta.fecha >= fecha_desde
    ).all()
    
    movimientos = []
    for item in ventas_items:
        movimientos.append({
            "tipo": "salida",
            "producto": item.producto.nombre,
            "cantidad": item.cantidad,
            "fecha": item.venta.fecha
        })
    
    return {
        "periodo": f"Últimos {dias} días",
        "cantidad_movimientos": len(movimientos),
        "movimientos": sorted(movimientos, key=lambda x: x["fecha"], reverse=True)
    }

# ==================== REPORTES DE PRODUCCIÓN ====================

@router.get("/reportes/produccion/eficiencia")
def reporte_eficiencia_produccion(dias: int = 30, db: Session = Depends(get_db)):
    """Reporte de eficiencia de producción"""
    fecha_desde = (datetime.utcnow() - timedelta(days=dias)).date()
    
    ordenes = db.query(OrdenProduccion).filter(
        func.date(OrdenProduccion.created_at) >= fecha_desde
    ).all()
    
    total_objetivo = sum(o.cantidad_objetivo for o in ordenes)
    total_producido = sum(o.cantidad_producida or 0 for o in ordenes)
    completadas = len([o for o in ordenes if o.estado == "completada"])
    
    return {
        "periodo": f"Últimos {dias} días",
        "ordenes_totales": len(ordenes),
        "ordenes_completadas": completadas,
        "tasa_cumplimiento": (completadas / len(ordenes) * 100) if ordenes else 0,
        "cantidad_objetivo_total": total_objetivo,
        "cantidad_producida_total": total_producido,
        "eficiencia_produccion": (total_producido / total_objetivo * 100) if total_objetivo > 0 else 0
    }

# ==================== REPORTES DE CLIENTES ====================

@router.get("/reportes/clientes/top-compradores")
def reporte_top_compradores(limit: int = 10, db: Session = Depends(get_db)):
    """Top clientes por monto gastado"""
    resultados = db.query(
        Venta.cliente_nombre,
        func.count(Venta.id).label("cantidad_compras"),
        func.sum(Venta.monto_final).label("monto_total")
    ).filter(Venta.cliente_nombre.isnot(None)).group_by(
        Venta.cliente_nombre
    ).order_by(
        func.sum(Venta.monto_final).desc()
    ).limit(limit).all()
    
    return [
        {
            "cliente": r[0],
            "cantidad_compras": r[1],
            "monto_total": r[2],
            "ticket_promedio": r[2] / r[1] if r[1] > 0 else 0
        }
        for r in resultados
    ]