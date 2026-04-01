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

// Proveedores
export const getProveedores = () => api.get<Proveedor[]>('/proveedores').then(r => r.data);

// Materia Prima
export const getMateriasPrimas = () =>
  api.get<any[]>('/materia-prima').then(r => {
    // Mapear respuesta del backend a formato esperado por el frontend
    return r.data.map(m => ({
      id: m.id,
      nombre: m.nombre,
      descripcion: m.descripcion,
      precio_por_unidad: m.precio_unitario, // ← MAPEO: backend usa precio_unitario
      stock_minimo: m.stock_minimo,
      categoria_id: m.categoria_id,
      unidad_medida_id: m.unidad_medida_id,
      activo: m.activo,
      categoria: { id: m.categoria_id, nombre: 'Categoría' },
      unidad_medida: { id: m.unidad_medida_id, nombre: 'Unidad', abreviatura: 'un' },
    }));
  });

export const getMateriaPrima = (id: number) =>
  api.get<ProductoMateriaPrima>(`/materia-prima/${id}`).then(r => r.data);

export const createMateriaPrima = (data: ProductoMateriaPrimaCreate) =>
  api.post<any>('/materia-prima', {
    nombre: data.nombre,
    descripcion: data.descripcion,
    categoria_id: data.categoria_id,
    unidad_medida_id: data.unidad_medida_id,
    precio_unitario: data.precio_por_unidad, // ← CAMBIO: enviar con nombre correcto del backend
    stock_minimo: data.stock_minimo,
  }).then(r => {
    // Mapear respuesta
    return {
      id: r.id,
      nombre: r.nombre,
      descripcion: r.descripcion,
      precio_por_unidad: r.precio_unitario,
      stock_minimo: r.stock_minimo,
      categoria_id: r.categoria_id,
      unidad_medida_id: r.unidad_medida_id,
      activo: r.activo,
      categoria: { id: r.categoria_id, nombre: 'Categoría' },
      unidad_medida: { id: r.unidad_medida_id, nombre: 'Unidad', abreviatura: 'un' },
    };
  });

export const updateMateriaPrima = (id: number, data: Partial<ProductoMateriaPrimaCreate>) =>
  api.put<ProductoMateriaPrima>(`/materia-prima/${id}`, {
    nombre: data.nombre,
    descripcion: data.descripcion,
    precio_unitario: data.precio_por_unidad,
    stock_minimo: data.stock_minimo,
  }).then(r => r.data);

export const deleteMateriaPrima = (id: number) =>
  api.delete(`/materia-prima/${id}`);

// Lotes
export const getLotes = () =>
  api.get<any[]>('/lotes-materia-prima').then(r => {
    // Mapear respuesta del backend a formato esperado por el frontend
    return r.data.map(l => ({
      id: l.id,
      numero_lote: l.lote_numero, // ← MAPEO: backend usa lote_numero
      producto_materia_prima_id: l.producto_id,
      cantidad_inicial: l.cantidad_inicial,
      cantidad_disponible: l.cantidad_actual, // ← MAPEO: backend usa cantidad_actual
      precio_compra: l.precio_total,
      fecha_compra: l.fecha_compra,
      fecha_vencimiento: l.fecha_vencimiento,
      estado: l.activo ? 'activo' : 'vencido',
      producto_materia_prima: {
        id: l.producto_id,
        nombre: 'Producto',
        descripcion: '',
        precio_por_unidad: 0,
        stock_minimo: 0,
        categoria_id: 0,
        unidad_medida_id: 0,
      },
    }));
  });

export const getLotesActivos = () =>
  api.get<any[]>('/lotes-materia-prima/activos').then(r => {
    // Mapear respuesta del backend a formato esperado por el frontend
    return r.data.map(l => ({
      id: l.id,
      numero_lote: l.lote_numero,
      producto_materia_prima_id: l.producto_id,
      cantidad_inicial: l.cantidad_inicial,
      cantidad_disponible: l.cantidad_actual,
      precio_compra: l.precio_total,
      fecha_compra: l.fecha_compra,
      fecha_vencimiento: l.fecha_vencimiento,
      estado: 'activo',
      producto_materia_prima: {
        id: l.producto_id,
        nombre: 'Producto',
        descripcion: '',
        precio_por_unidad: 0,
        stock_minimo: 0,
        categoria_id: 0,
        unidad_medida_id: 0,
      },
    }));
  });

export const createLote = (data: LoteCreate) =>
  api.post<any>('/lotes-materia-prima', {
    producto_id: data.producto_materia_prima_id,
    lote_numero: data.numero_lote,
    cantidad_inicial: data.cantidad_inicial,
    precio_total: data.precio_compra,
    fecha_compra: data.fecha_compra,
    fecha_vencimiento: data.fecha_vencimiento,
    activo: true,
    proveedor_id: 1, // valor por defecto
  }).then(r => {
    // Mapear respuesta
    return {
      id: r.id,
      numero_lote: r.lote_numero,
      producto_materia_prima_id: r.producto_id,
      cantidad_inicial: r.cantidad_inicial,
      cantidad_disponible: r.cantidad_actual,
      precio_compra: r.precio_total,
      fecha_compra: r.fecha_compra,
      fecha_vencimiento: r.fecha_vencimiento,
      estado: 'activo',
      producto_materia_prima: {
        id: r.producto_id,
        nombre: 'Producto',
        descripcion: '',
        precio_por_unidad: 0,
        stock_minimo: 0,
        categoria_id: 0,
        unidad_medida_id: 0,
      },
    };
  });