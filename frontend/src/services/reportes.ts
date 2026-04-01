import api from './api';
import type { DashboardData, VentaPorDia, ProductoMasVendido, AlertaStock } from '../types';

// Dashboard principal con KPIs
export const getDashboard = () =>
    api.get<DashboardData>('/reportes/dashboard').then(r => {
        // Mapear respuesta del backend a formato esperado
        const data = r.data;
        return {
            ventas_hoy: data.kpis?.ventas_hoy?.monto || 0,
            num_ventas_hoy: data.kpis?.ventas_hoy?.cantidad || 0,
            ventas_mes: data.kpis?.ventas_mes?.monto || 0,
            ordenes_activas: data.kpis?.ordenes_pendientes || 0,
            productos_con_stock: 0,
            lotes_proximos_vencer: data.alertas?.vencimiento_proximo?.length || 0,
        };
    });

// Ventas por día (últimos N días)
export const getVentasPorDia = (dias = 7) =>
    api.get<any>('/reportes/financiero/mensual').then(r => {
        const data = r.data;
        const ventasPorDia: VentaPorDia[] = [];

        if (data.detalle_diario) {
            Object.entries(data.detalle_diario).forEach(([fecha, info]: any) => {
                ventasPorDia.push({
                    fecha,
                    total: info.monto || 0,
                    cantidad: info.cantidad || 0,
                });
            });
        }

        return ventasPorDia.slice(-dias);
    });

// Productos más vendidos
export const getProductosMasVendidos = (limite = 10) =>
    api.get<any>('/ventas/productos-mas-vendidos?limit=' + limite).then(r => {
        return r.data.map((item: any) => ({
            nombre: item.nombre,
            total_vendido: item.cantidad_vendida || 0,
            total_facturado: item.monto_total || 0,
        }));
    });

// Resumen de producción
export const getResumenProduccion = () =>
    api.get<any>('/produccion/reporte/pendientes').then(r => {
        const data = r.data;
        const resultado: Record<string, number> = {
            pendiente: 0,
            en_proceso: 0,
            completada: 0,
            cancelada: 0,
        };

        if (data.ordenes) {
            data.ordenes.forEach((orden: any) => {
                resultado[orden.estado] = (resultado[orden.estado] || 0) + 1;
            });
        }

        return resultado;
    });

// Alertas de stock bajo
export const getAlertasStock = () =>
    api.get<any>('/inventario/bajo-stock').then(r => {
        return r.data.map((item: any) => ({
            id: item.producto_id,
            nombre: item.producto_nombre,
            stock_actual: item.stock_actual || 0,
            stock_minimo: item.stock_minimo || 0,
        }));
    });