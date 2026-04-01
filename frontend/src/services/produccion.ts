import api from './api';
import type { OrdenProduccion, OrdenCreate } from '../types';

export const getOrdenes = () =>
  api.get<OrdenProduccion[]>('/produccion/ordenes').then(r => {
    return r.data.map((orden: any) => ({
      id: orden.id,
      numero_orden: `OP-${String(orden.id).padStart(5, '0')}`,
      receta_id: orden.receta_id,
      cantidad_planificada: orden.cantidad_objetivo,
      cantidad_producida: orden.cantidad_producida || 0,
      estado: orden.estado === 'en_progreso' ? 'en_proceso' : orden.estado,
      fecha_planificada: orden.fecha_inicio ? new Date(orden.fecha_inicio).toISOString().split('T')[0] : null,
      notas: orden.notas,
    }));
  });

export const getOrden = (id: number) =>
  api.get<OrdenProduccion>(`/produccion/ordenes/${id}`).then(r => {
    const orden = r.data;
    return {
      id: orden.id,
      numero_orden: `OP-${String(orden.id).padStart(5, '0')}`,
      receta_id: orden.receta_id,
      cantidad_planificada: orden.cantidad_objetivo,
      cantidad_producida: orden.cantidad_producida || 0,
      estado: orden.estado === 'en_progreso' ? 'en_proceso' : orden.estado,
      fecha_planificada: orden.fecha_inicio ? new Date(orden.fecha_inicio).toISOString().split('T')[0] : null,
      notas: orden.notas,
    };
  });

export const createOrden = (data: OrdenCreate) =>
  api.post<OrdenProduccion>('/produccion/ordenes', {
    receta_id: data.receta_id,
    cantidad_objetivo: data.cantidad_planificada,
    notas: data.notas,
  }).then(r => {
    const orden = r.data;
    return {
      id: orden.id,
      numero_orden: `OP-${String(orden.id).padStart(5, '0')}`,
      receta_id: orden.receta_id,
      cantidad_planificada: orden.cantidad_objetivo,
      cantidad_producida: orden.cantidad_producida || 0,
      estado: orden.estado === 'en_progreso' ? 'en_proceso' : orden.estado,
      fecha_planificada: null,
      notas: orden.notas,
    };
  });

export const iniciarOrden = (id: number) =>
  api.put<OrdenProduccion>(`/produccion/ordenes/${id}`, {
    estado: 'en_progreso',
  }).then(r => {
    const orden = r.data;
    return {
      id: orden.id,
      numero_orden: `OP-${String(orden.id).padStart(5, '0')}`,
      receta_id: orden.receta_id,
      cantidad_planificada: orden.cantidad_objetivo,
      cantidad_producida: orden.cantidad_producida || 0,
      estado: 'en_proceso',
      fecha_planificada: orden.fecha_inicio ? new Date(orden.fecha_inicio).toISOString().split('T')[0] : null,
      notas: orden.notas,
    };
  });

export const completarOrden = (id: number, cantidad_producida: number, producto_id?: number) =>
  api.put<OrdenProduccion>(`/produccion/ordenes/${id}`, {
    estado: 'completada',
    cantidad_producida,
  }).then(r => {
    const orden = r.data;
    return {
      id: orden.id,
      numero_orden: `OP-${String(orden.id).padStart(5, '0')}`,
      receta_id: orden.receta_id,
      cantidad_planificada: orden.cantidad_objetivo,
      cantidad_producida: orden.cantidad_producida || cantidad_producida,
      estado: 'completada',
      fecha_planificada: orden.fecha_finalizacion ? new Date(orden.fecha_finalizacion).toISOString().split('T')[0] : null,
      notas: orden.notas,
    };
  });

export const cancelarOrden = (id: number) =>
  api.put<OrdenProduccion>(`/produccion/ordenes/${id}`, {
    estado: 'cancelada',
  }).then(r => {
    const orden = r.data;
    return {
      id: orden.id,
      numero_orden: `OP-${String(orden.id).padStart(5, '0')}`,
      receta_id: orden.receta_id,
      cantidad_planificada: orden.cantidad_objetivo,
      cantidad_producida: orden.cantidad_producida || 0,
      estado: 'cancelada',
      fecha_planificada: orden.fecha_inicio ? new Date(orden.fecha_inicio).toISOString().split('T')[0] : null,
      notas: orden.notas,
    };
  });