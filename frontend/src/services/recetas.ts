import api from './api';
import type { Receta, RecetaCreate } from '../types';

export const getRecetas = () =>
    api.get<any[]>('/recetas').then(r => {
        // Mapear respuesta del backend a formato esperado por el frontend
        return r.data.map(rec => ({
            id: rec.id,
            nombre: rec.nombre,
            descripcion: rec.descripcion,
            rendimiento_unidades: rec.rendimiento, // ← MAPEO: backend usa rendimiento
            tiempo_preparacion_min: rec.tiempo_preparacion || 0, // ← MAPEO: backend usa tiempo_preparacion
            instrucciones: rec.descripcion || '', // usar descripción como instrucciones
            ingredientes: rec.ingredientes || [],
            activo: rec.activo !== false,
        }));
    });

export const getReceta = (id: number) =>
    api.get<any>(`/recetas/${id}`).then(r => {
        const rec = r.data;
        return {
            id: rec.id,
            nombre: rec.nombre,
            descripcion: rec.descripcion,
            rendimiento_unidades: rec.rendimiento,
            tiempo_preparacion_min: rec.tiempo_preparacion || 0,
            instrucciones: rec.descripcion || '',
            ingredientes: rec.ingredientes || [],
            activo: rec.activo !== false,
        };
    });

export const createReceta = (data: RecetaCreate) =>
    api.post<any>('/recetas', {
        nombre: data.nombre,
        descripcion: data.descripcion,
        rendimiento: data.rendimiento_unidades, // ← CAMBIO: enviar con nombre correcto del backend
        tiempo_preparacion: data.tiempo_preparacion_min, // ← CAMBIO: enviar con nombre correcto del backend
        unidad_rendimiento_id: 5, // ← AGREGAR: unidad por defecto (unidad)
        costo_estimado: 0, // valor por defecto
        ingredientes: data.ingredientes || [],
    }).then(r => {
        const rec = r.data;
        return {
            id: rec.id,
            nombre: rec.nombre,
            descripcion: rec.descripcion,
            rendimiento_unidades: rec.rendimiento,
            tiempo_preparacion_min: rec.tiempo_preparacion || 0,
            instrucciones: rec.descripcion || '',
            ingredientes: rec.ingredientes || [],
            activo: rec.activo !== false,
        };
    });

export const updateReceta = (id: number, data: Partial<RecetaCreate>) =>
    api.put<any>(`/recetas/${id}`, {
        nombre: data.nombre,
        descripcion: data.descripcion,
        rendimiento: data.rendimiento_unidades,
        tiempo_preparacion: data.tiempo_preparacion_min,
    }).then(r => {
        const rec = r.data;
        return {
            id: rec.id,
            nombre: rec.nombre,
            descripcion: rec.descripcion,
            rendimiento_unidades: rec.rendimiento,
            tiempo_preparacion_min: rec.tiempo_preparacion || 0,
            instrucciones: rec.descripcion || '',
            ingredientes: rec.ingredientes || [],
            activo: rec.activo !== false,
        };
    });

export const deleteReceta = (id: number) =>
    api.delete(`/recetas/${id}`);