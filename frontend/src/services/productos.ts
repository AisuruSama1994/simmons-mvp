import api from './api';
import type { Producto, ProductoCreate, InventarioProducto } from '../types';

export const getProductos = () => api.get<Producto[]>('/productos').then(r => r.data);
export const getProducto = (id: number) => api.get<Producto>(`/productos/${id}`).then(r => r.data);
export const createProducto = (data: ProductoCreate) => api.post<Producto>('/productos', data).then(r => r.data);
export const updateProducto = (id: number, data: Partial<ProductoCreate>) => api.put<Producto>(`/productos/${id}`, data).then(r => r.data);
export const deleteProducto = (id: number) => api.delete(`/productos/${id}`);
export const getInventarioProducto = (id: number) => api.get<InventarioProducto>(`/productos/${id}/inventario`).then(r => r.data);
