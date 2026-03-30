import api from './api';
import type { OrdenProduccion, OrdenCreate } from '../types';

export const getOrdenes = () => api.get<OrdenProduccion[]>('/produccion').then(r => r.data);
export const getOrden = (id: number) => api.get<OrdenProduccion>(`/produccion/${id}`).then(r => r.data);
export const createOrden = (data: OrdenCreate) => api.post<OrdenProduccion>('/produccion', data).then(r => r.data);
export const iniciarOrden = (id: number) => api.post<OrdenProduccion>(`/produccion/${id}/iniciar`).then(r => r.data);
export const completarOrden = (id: number, cantidad_producida: number, producto_id?: number) =>
  api.post<OrdenProduccion>(`/produccion/${id}/completar`, { orden_id: id, cantidad_producida, producto_id }).then(r => r.data);
export const cancelarOrden = (id: number) => api.post<OrdenProduccion>(`/produccion/${id}/cancelar`).then(r => r.data);
