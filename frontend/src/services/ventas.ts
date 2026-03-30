import api from './api';
import type { Venta, VentaCreate } from '../types';

export const getVentas = () => api.get<Venta[]>('/ventas').then(r => r.data);
export const getVenta = (id: number) => api.get<Venta>(`/ventas/${id}`).then(r => r.data);
export const createVenta = (data: VentaCreate) => api.post<Venta>('/ventas', data).then(r => r.data);
export const anularVenta = (id: number, motivo?: string) => api.post<Venta>(`/ventas/${id}/anular`, { motivo }).then(r => r.data);
