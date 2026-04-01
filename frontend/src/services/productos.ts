import api from './api';
import type { Producto, ProductoCreate, InventarioProducto } from '../types';

export const getProductos = () =>
    api.get<any[]>('/productos').then(r => {
        return r.data.map(p => ({
            id: p.id,
            nombre: p.nombre,
            descripcion: p.descripcion || '',
            precio_venta: p.precio_unitario,
            unidad_venta: 'unidad',
            receta_id: p.receta_id,
        }));
    });

export const getProducto = (id: number) =>
    api.get<any>(`/productos/${id}`).then(r => {
        const p = r.data;
        return {
            id: p.id,
            nombre: p.nombre,
            descripcion: p.descripcion || '',
            precio_venta: p.precio_unitario,
            unidad_venta: 'unidad',
            receta_id: p.receta_id,
        };
    });

export const createProducto = (data: any) =>
    api.post<any>('/productos', {
        nombre: data.nombre,
        descripcion: data.descripcion,
        receta_id: data.receta_id,
        precio_unitario: data.precio_venta,
        stock_minimo: 0,
    }).then(r => {
        const p = r.data;
        return {
            id: p.id,
            nombre: p.nombre,
            descripcion: p.descripcion || '',
            precio_venta: p.precio_unitario,
            unidad_venta: 'unidad',
            receta_id: p.receta_id,
        };
    });

export const updateProducto = (id: number, data: any) =>
    api.put<any>(`/productos/${id}`, {
        nombre: data.nombre,
        precio_unitario: data.precio_venta,
    }).then(r => r.data);

export const deleteProducto = (id: number) =>
    api.delete(`/productos/${id}`);

export const getInventarioProducto = (id: number) =>
    api.get<any>(`/inventario/productos/${id}`).then(r => r.data);