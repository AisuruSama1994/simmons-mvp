import api from './api';
import type {
  ProductoMateriaPrima, ProductoMateriaPrimaCreate,
  LoteMateriaPrima, LoteCreate,
  Categoria, UnidadMedida, Proveedor,
} from '../types';

// Categorías
export const getCategorias = () => api.get<Categoria[]>('/categorias-materia-prima').then(r => r.data);
export const createCategoria = (data: { nombre: string }) => api.post<Categoria>('/categorias-materia-prima', data).then(r => r.data);

// Unidades
export const getUnidades = () => api.get<UnidadMedida[]>('/unidades-medida').then(r => r.data);
export const createUnidad = (data: { nombre: string; abreviatura: string }) => api.post<UnidadMedida>('/unidades-medida', data).then(r => r.data);

// Proveedores (reexportados desde materia prima service)
export const getProveedores = () => api.get<Proveedor[]>('/proveedores').then(r => r.data);

// Materia Prima
export const getMateriasPrimas = () => api.get<ProductoMateriaPrima[]>('/materia-prima').then(r => r.data);
export const getMateriaPrima = (id: number) => api.get<ProductoMateriaPrima>(`/materia-prima/${id}`).then(r => r.data);
export const createMateriaPrima = (data: ProductoMateriaPrimaCreate) => api.post<ProductoMateriaPrima>('/materia-prima', data).then(r => r.data);
export const updateMateriaPrima = (id: number, data: Partial<ProductoMateriaPrimaCreate>) => api.put<ProductoMateriaPrima>(`/materia-prima/${id}`, data).then(r => r.data);
export const deleteMateriaPrima = (id: number) => api.delete(`/materia-prima/${id}`);

// Lotes
export const getLotes = () => api.get<LoteMateriaPrima[]>('/lotes-materia-prima').then(r => r.data);
export const getLotesActivos = () => api.get<LoteMateriaPrima[]>('/lotes-materia-prima/activos').then(r => r.data);
export const createLote = (data: LoteCreate) => api.post<LoteMateriaPrima>('/lotes-materia-prima', data).then(r => r.data);
