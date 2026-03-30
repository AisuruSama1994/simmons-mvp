import api from './api';
import type { DashboardData, VentaPorDia, ProductoMasVendido, AlertaStock } from '../types';

export const getDashboard = () => api.get<DashboardData>('/reportes/dashboard').then(r => r.data);
export const getVentasPorDia = (dias = 7) => api.get<VentaPorDia[]>(`/reportes/ventas-por-dia?dias=${dias}`).then(r => r.data);
export const getProductosMasVendidos = (limite = 10) => api.get<ProductoMasVendido[]>(`/reportes/productos-mas-vendidos?limite=${limite}`).then(r => r.data);
export const getResumenProduccion = () => api.get<Record<string, number>>('/reportes/produccion').then(r => r.data);
export const getAlertasStock = () => api.get<AlertaStock[]>('/inventario/alertas').then(r => r.data);
