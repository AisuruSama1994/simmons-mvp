"""
app/utils/stock_manager.py

Utility para manejar validación, descuentos y auditoría de stock de materia prima.
"""

from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.materia_prima import LoteMateriaPrima, ProductoMateriaPrima
from app.models.auditoria import MovimientoInventario
from datetime import datetime
from typing import List, Tuple, Optional
from fastapi import HTTPException

class StockManager:
    """Maneja todas las operaciones de stock de materia prima"""
    
    @staticmethod
    def obtener_stock_total(db: Session, producto_id: int) -> float:
        """
        Obtiene el stock total de una materia prima sumando todos los lotes activos.
        
        EJEMPLO:
        --------
        MANTECA:
        - Lote 1 (SERENÍSIMA): 1250g
        - Lote 2 (TONADITA): 2500g
        TOTAL: 3750g
        """
        total = db.query(func.sum(LoteMateriaPrima.cantidad_actual)).filter(
            LoteMateriaPrima.producto_id == producto_id,
            LoteMateriaPrima.activo == True
        ).scalar()
        
        return total or 0.0
    
    @staticmethod
    def obtener_lotes_activos(db: Session, producto_id: int) -> List[LoteMateriaPrima]:
        """Obtiene todos los lotes activos de una materia prima"""
        return db.query(LoteMateriaPrima).filter(
            LoteMateriaPrima.producto_id == producto_id,
            LoteMateriaPrima.activo == True
        ).all()
    
    @staticmethod
    def validar_stock_disponible(
        db: Session, 
        producto_id: int, 
        cantidad_necesaria: float
    ) -> Tuple[bool, float, float]:
        """
        Valida si hay suficiente stock disponible.
        
        Retorna: (hay_stock, stock_disponible, diferencia)
        - hay_stock: True si hay suficiente, False si falta
        - stock_disponible: cantidad total disponible
        - diferencia: cantidad que falta (negativa si falta, 0 si hay suficiente)
        
        EJEMPLO:
        --------
        validar_stock_disponible(db, producto_id=1, cantidad_necesaria=100)
        -> (True, 3750, 3650)  # Hay suficiente, sobra 3650g
        
        validar_stock_disponible(db, producto_id=2, cantidad_necesaria=50)
        -> (False, 30, -20)  # No hay suficiente, falta 20 unidades
        """
        stock_disponible = StockManager.obtener_stock_total(db, producto_id)
        diferencia = stock_disponible - cantidad_necesaria
        hay_stock = diferencia >= 0
        
        return (hay_stock, stock_disponible, diferencia)
    
    @staticmethod
    def descontar_stock(
        db: Session,
        producto_id: int,
        cantidad: float,
        razon: str,
        referencia: Optional[str] = None,
        usuario_id: Optional[int] = None,
        lote_id: Optional[int] = None
    ) -> MovimientoInventario:
        """
        Descuenta stock y registra el movimiento.
        
        PARÁMETROS:
        -----------
        producto_id: ID de la materia prima a descontar
        cantidad: Cantidad a descontar (en la unidad base de la materia prima)
        razon: Descripción del motivo (ej: "Orden de producción #42")
        referencia: ID de la orden, venta, etc. (opcional)
        usuario_id: ID del usuario que realizó el movimiento (opcional)
        lote_id: ID del lote específico a descontar (opcional, si no se especifica se descuenta de los disponibles)
        
        EJEMPLO:
        --------
        descontar_stock(
            db=db,
            producto_id=1,  # MANTECA
            cantidad=100,   # 100 gramos
            razon="Orden de producción",
            referencia="42"
        )
        
        LÓGICA:
        -------
        Si se especifica lote_id, descuenta de ese lote específico.
        Si no, descuenta de los lotes disponibles en orden FIFO (first in, first out).
        """
        # Validar que hay stock
        hay_stock, stock_disponible, _ = StockManager.validar_stock_disponible(
            db, producto_id, cantidad
        )
        
        if not hay_stock:
            raise HTTPException(
                status_code=400,
                detail=f"Stock insuficiente. Disponible: {stock_disponible}, Necesario: {cantidad}"
            )
        
        # Si se especifica lote, descontar de ese
        if lote_id:
            lote = db.query(LoteMateriaPrima).filter(
                LoteMateriaPrima.id == lote_id,
                LoteMateriaPrima.activo == True
            ).first()
            
            if not lote:
                raise HTTPException(status_code=404, detail="Lote no encontrado")
            
            cantidad_anterior = lote.cantidad_actual
            lote.cantidad_actual -= cantidad
            if lote.cantidad_actual < 0:
                lote.cantidad_actual = 0
            cantidad_posterior = lote.cantidad_actual
        else:
            # Descontar de los lotes en orden FIFO
            lotes = StockManager.obtener_lotes_activos(db, producto_id)
            cantidad_a_descontar = cantidad
            cantidad_anterior = stock_disponible
            
            for lote in lotes:
                if cantidad_a_descontar <= 0:
                    break
                
                if lote.cantidad_actual >= cantidad_a_descontar:
                    lote.cantidad_actual -= cantidad_a_descontar
                    cantidad_a_descontar = 0
                else:
                    cantidad_a_descontar -= lote.cantidad_actual
                    lote.cantidad_actual = 0
            
            cantidad_posterior = stock_disponible - cantidad
        
        # Registrar movimiento en auditoría
        movimiento = MovimientoInventario(
            tipo_movimiento="produccion",  # o salida, ajuste, etc.
            producto_materia_prima_id=producto_id,
            lote_materia_prima_id=lote_id,
            cantidad=cantidad,
            cantidad_anterior=cantidad_anterior,
            cantidad_posterior=cantidad_posterior,
            razon=razon,
            referencia=referencia,
            fecha=datetime.utcnow(),
            realizado_por_id=usuario_id
        )
        
        db.add(movimiento)
        db.commit()
        
        return movimiento
    
    @staticmethod
    def obtener_movimientos_recientes(
        db: Session,
        producto_id: Optional[int] = None,
        tipo_movimiento: Optional[str] = None,
        dias: int = 30
    ) -> List[MovimientoInventario]:
        """
        Obtiene el historial de movimientos de inventario filtrado por:
        - producto_id (opcional)
        - tipo_movimiento (opcional: entrada, salida, produccion, venta, ajuste)
        - últimos N días
        
        EJEMPLO:
        --------
        # Últimos movimientos de MANTECA en los últimos 7 días
        movimientos = obtener_movimientos_recientes(
            db, 
            producto_id=1, 
            dias=7
        )
        
        # Movimientos de producción en los últimos 30 días
        movimientos = obtener_movimientos_recientes(
            db,
            tipo_movimiento="produccion",
            dias=30
        )
        """
        from datetime import timedelta
        
        fecha_desde = datetime.utcnow() - timedelta(days=dias)
        
        query = db.query(MovimientoInventario).filter(
            MovimientoInventario.fecha >= fecha_desde
        )
        
        if producto_id:
            query = query.filter(MovimientoInventario.producto_materia_prima_id == producto_id)
        
        if tipo_movimiento:
            query = query.filter(MovimientoInventario.tipo_movimiento == tipo_movimiento)
        
        return query.order_by(MovimientoInventario.fecha.desc()).all()
    
    @staticmethod
    def obtener_stock_por_estado(
        db: Session,
        producto_id: int
    ) -> dict:
        """
        Obtiene un resumen del stock desglosado por lote.
        
        RESPUESTA:
        ----------
        {
            "producto_id": 1,
            "producto_nombre": "MANTECA",
            "stock_total": 3750,
            "lotes": [
                {
                    "lote_id": 10,
                    "proveedor": "SERENÍSIMA",
                    "cantidad": 1250,
                    "fecha_vencimiento": "2026-06-08",
                    "dias_para_vencer": 60
                },
                {
                    "lote_id": 11,
                    "proveedor": "TONADITA",
                    "cantidad": 2500,
                    "fecha_vencimiento": "2026-07-15",
                    "dias_para_vencer": 97
                }
            ]
        }
        """
        from datetime import timedelta
        
        lotes = StockManager.obtener_lotes_activos(db, producto_id)
        producto = db.query(ProductoMateriaPrima).filter(
            ProductoMateriaPrima.id == producto_id
        ).first()
        
        if not producto:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        
        lotes_info = []
        for lote in lotes:
            dias_para_vencer = None
            if lote.fecha_vencimiento:
                dias_para_vencer = (lote.fecha_vencimiento.date() - datetime.utcnow().date()).days
            
            lotes_info.append({
                "lote_id": lote.id,
                "proveedor": lote.proveedor.nombre if lote.proveedor else None,
                "cantidad": lote.cantidad_actual,
                "lote_numero": lote.lote_numero,
                "fecha_vencimiento": lote.fecha_vencimiento,
                "dias_para_vencer": dias_para_vencer,
                "precio_unitario": lote.precio_unitario
            })
        
        return {
            "producto_id": producto_id,
            "producto_nombre": producto.nombre,
            "unidad_medida": producto.unidad_medida.nombre if producto.unidad_medida else None,
            "stock_total": StockManager.obtener_stock_total(db, producto_id),
            "stock_minimo": producto.stock_minimo,
            "lotes": lotes_info
        }