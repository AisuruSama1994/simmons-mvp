import api from './api';
import type { Venta, VentaCreate } from '../types';

export const getVentas = () =>
    api.get<any[]>('/ventas').then(r => {
        return r.data.map((venta: any) => ({
            id: venta.id,
            numero_venta: venta.numero_venta,
            total: venta.monto_final,
            metodo_pago: venta.metodo_pago || 'efectivo',
            estado: venta.estado,
            items: venta.items || [],
            created_at: venta.fecha,
        }));
    });

export const getVenta = (id: number) =>
    api.get<any>(`/ventas/${id}`).then(r => {
        const venta = r.data;
        return {
            id: venta.id,
            numero_venta: venta.numero_venta,
            total: venta.monto_final,
            metodo_pago: venta.metodo_pago || 'efectivo',
            estado: venta.estado,
            items: venta.items || [],
            created_at: venta.fecha,
        };
    });

export const createVenta = (data: VentaCreate) =>
    api.post<any>('/ventas', {
        items: data.items.map(item => ({
            producto_id: item.producto_id,
            cantidad: item.cantidad,
            precio_unitario: item.precio_unitario,
        })),
        descuento: data.descuento || 0,
        metodo_pago: data.metodo_pago,
        tipo_venta: 'mostrador',
    }).then(r => {
        const venta = r.data;
        return {
            id: venta.id,
            numero_venta: venta.numero_venta,
            total: venta.monto_final,
            metodo_pago: venta.metodo_pago || 'efectivo',
            estado: venta.estado,
            items: venta.items || [],
            created_at: venta.fecha,
        };
    });

export const anularVenta = (id: number, motivo?: string) =>
    api.put<any>(`/ventas/${id}`, {
        estado: 'anulada',
    }).then(r => {
        const venta = r.data;
        return {
            id: venta.id,
            numero_venta: venta.numero_venta,
            total: venta.monto_final,
            metodo_pago: venta.metodo_pago || 'efectivo',
            estado: venta.estado,
            items: venta.items || [],
            created_at: venta.fecha,
        };
    });