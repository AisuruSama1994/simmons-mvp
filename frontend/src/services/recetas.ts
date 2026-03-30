import api from './api';
import type { Receta, RecetaCreate } from '../types';

export const getRecetas = () => api.get<Receta[]>('/recetas').then(r => r.data);
export const getReceta = (id: number) => api.get<Receta>(`/recetas/${id}`).then(r => r.data);
export const createReceta = (data: RecetaCreate) => api.post<Receta>('/recetas', data).then(r => r.data);
export const updateReceta = (id: number, data: Partial<RecetaCreate>) => api.put<Receta>(`/recetas/${id}`, data).then(r => r.data);
export const deleteReceta = (id: number) => api.delete(`/recetas/${id}`);
