import api from './api';
import type {
  ProductoMateriaPrima, ProductoMateriaPrimaCreate,
  LoteMateriaPrima, LoteCreate,
  Categoria, UnidadMedida,
  Proveedor, ProveedorCreate,
  ProductoProveedorPrecio, ProductoProveedorPrecioCreate,
} from '../types';

// ─── Categorías ────────────────────────────────────────────────

export const getCategorias = () =>
  api.get<Categoria[]>('/categorias-materia-prima').then(r => r.data);

export const createCategoria = (data: { nombre: string; descripcion?: string }) =>
  api.post<Categoria>('/categorias-materia-prima', data).then(r => r.data);

export const updateCategoria = (id: number, data: { nombre: string; descripcion?: string }) =>
  api.put<Categoria>(`/categorias-materia-prima/${id}`, data).then(r => r.data);

export const deleteCategoria = (id: number) =>
  api.delete(`/categorias-materia-prima/${id}`);

// ─── Unidades de medida ────────────────────────────────────────

export const getUnidades = () =>
  api.get<UnidadMedida[]>('/unidades-medida').then(r => r.data);

export const createUnidad = (data: { nombre: string; abreviatura: string; tipo: string }) =>
  api.post<UnidadMedida>('/unidades-medida', {
    nombre: data.nombre,
    abreviacion: data.abreviatura,
    tipo: data.tipo,
  }).then(r => r.data);

// ─── Proveedores ───────────────────────────────────────────────

export const getProveedores = () =>
  api.get<Proveedor[]>('/proveedores').then(r => r.data);

export const getProveedor = (id: number) =>
  api.get<Proveedor>(`/proveedores/${id}`).then(r => r.data);

export const createProveedor = (data: ProveedorCreate) =>
  api.post<Proveedor>('/proveedores', data).then(r => r.data);

export const updateProveedor = (id: number, data: Partial<ProveedorCreate>) =>
  api.put<Proveedor>(`/proveedores/${id}`, data).then(r => r.data);

export const deleteProveedor = (id: number) =>
  api.delete(`/proveedores/${id}`);

// ─── Materia Prima ─────────────────────────────────────────────

const mapMateriaPrima = (m: any): ProductoMateriaPrima => ({
  id: m.id,
  nombre: m.nombre,
  marca: m.marca,
  presentacion: m.presentacion,
  codigo_barras: m.codigo_barras,
  imagen_url: m.imagen_url,
  descripcion: m.descripcion,
  stock_minimo: m.stock_minimo,
  categoria_id: m.categoria_id,
  unidad_medida_id: m.unidad_medida_id,
  activo: m.activo,
  created_at: m.created_at,
  categoria: m.categoria,
  unidad_medida: m.unidad_medida
    ? { ...m.unidad_medida, abreviatura: m.unidad_medida.abreviacion ?? m.unidad_medida.abreviatura }
    : undefined,
  proveedores_asociados: m.proveedores_asociados,
});

export const getMateriasPrimas = () =>
  api.get<any[]>('/materia-prima').then(r => r.data.map(mapMateriaPrima));

export const getMateriaPrima = (id: number) =>
  api.get<any>(`/materia-prima/${id}`).then(r => mapMateriaPrima(r.data));

export const createMateriaPrima = (data: ProductoMateriaPrimaCreate) =>
  api.post<any>('/materia-prima', {
    nombre: data.nombre,
    marca: data.marca,
    presentacion: data.presentacion,
    codigo_barras: data.codigo_barras,
    descripcion: data.descripcion,
    categoria_id: data.categoria_id,
    unidad_medida_id: data.unidad_medida_id,
    stock_minimo: data.stock_minimo,
  }).then(r => mapMateriaPrima(r.data));

export const updateMateriaPrima = (id: number, data: Partial<ProductoMateriaPrimaCreate>) =>
  api.put<any>(`/materia-prima/${id}`, {
    nombre: data.nombre,
    marca: data.marca,
    presentacion: data.presentacion,
    codigo_barras: data.codigo_barras,
    descripcion: data.descripcion,
    stock_minimo: data.stock_minimo,
    categoria_id: data.categoria_id,
    unidad_medida_id: data.unidad_medida_id,
  }).then(r => mapMateriaPrima(r.data));

export const deleteMateriaPrima = (id: number) =>
  api.delete(`/materia-prima/${id}`);

// ─── Relación Producto ↔ Proveedor ────────────────────────────

export const getProveedoresPorProducto = (productoId: number) =>
  api.get<ProductoProveedorPrecio[]>(`/materia-prima/${productoId}/proveedores`).then(r => r.data);

export const asociarProveedorAProducto = (data: ProductoProveedorPrecioCreate) =>
  api.post<ProductoProveedorPrecio>('/producto-proveedor', data).then(r => r.data);

export const actualizarPrecioProveedor = (id: number, precio: number) =>
  api.patch<ProductoProveedorPrecio>(`/producto-proveedor/${id}`, { precio_referencia: precio }).then(r => r.data);

export const desasociarProveedor = (id: number) =>
  api.delete(`/producto-proveedor/${id}`);

// ─── Lotes ─────────────────────────────────────────────────────

const mapLote = (l: any): LoteMateriaPrima => ({
  id: l.id,
  numero_lote: l.lote_numero ?? l.numero_lote,
  producto_materia_prima_id: l.producto_id ?? l.producto_materia_prima_id,
  proveedor_id: l.proveedor_id,
  cantidad_inicial: l.cantidad_inicial,
  cantidad_disponible: l.cantidad_actual ?? l.cantidad_disponible,
  precio_compra: l.precio_total ?? l.precio_compra,
  precio_unitario: l.precio_unitario,
  fecha_compra: l.fecha_compra,
  fecha_vencimiento: l.fecha_vencimiento,
  codigo_barras_lote: l.codigo_barras_lote,
  estado: l.activo === false ? 'agotado' : 'disponible',
  notas: l.notas,
  created_at: l.created_at,
  producto_materia_prima: l.producto ? mapMateriaPrima(l.producto) : undefined,
  proveedor: l.proveedor,
});

export const getLotes = () =>
  api.get<any[]>('/lotes-materia-prima').then(r => r.data.map(mapLote));

export const getLotesActivos = () =>
  api.get<any[]>('/lotes-materia-prima/activos').then(r => r.data.map(mapLote));

export const getLotesProximosAVencer = () =>
  api.get<any[]>('/lotes-materia-prima/proximos-vencer').then(r => r.data.map(mapLote));

export const createLote = (data: LoteCreate) =>
  api.post<any>('/lotes-materia-prima', {
    producto_id: data.producto_materia_prima_id,
    proveedor_id: data.proveedor_id,
    lote_numero: data.numero_lote,
    cantidad_inicial: data.cantidad_inicial,
    cantidad_actual: data.cantidad_inicial,
    precio_total: data.precio_compra ?? 0,
    precio_unitario: data.precio_compra && data.cantidad_inicial
      ? (data.precio_compra as number) / (data.cantidad_inicial as number)
      : undefined,
    fecha_compra: data.fecha_compra,
    fecha_vencimiento: data.fecha_vencimiento,
    codigo_barras_lote: data.codigo_barras_lote,
    activo: true,
  }).then(r => mapLote(r.data));

export const deleteLote = (id: number) =>
  api.delete(`/lotes-materia-prima/${id}`);

// ─── STOCK TOTAL (FASE 2) ──────────────────────────────────────

export interface StockTotal {
  producto_id: number;
  producto_nombre: string;
  unidad_medida_nombre: string;
  unidad_abreviacion: string;
  stock_total: number;
  cantidad_lotes: number;
  stock_minimo: number;
  estado_stock: 'OK' | 'BAJO' | 'ALERTA' | 'VENCIDO';
}

export interface AlertaStock {
  producto_id: number;
  producto_nombre: string;
  stock_actual: number;
  stock_minimo: number;
  unidad_medida: string;
  diferencia: number;
  estado: 'BAJO' | 'ALERTA';
}

export interface LoteProximoVencer {
  lote_id: number;
  producto_nombre: string;
  proveedor?: string;
  cantidad: number;
  unidad_medida: string;
  fecha_vencimiento: string;
  dias_para_vencer: number;
}

/**
 * Obtener stock total de TODAS las materias primas
 */
export const getStockTotal = () =>
  api.get<StockTotal[]>('/stock-total').then(r => r.data);

/**
 * Obtener stock total de una materia prima específica
 */
export const getStockTotalProducto = (productoId: number) =>
  api.get<StockTotal>(`/stock-total/${productoId}`).then(r => r.data);

/**
 * Obtener desglose de lotes por producto
 */
export const getLotesPorProducto = (productoId: number) =>
  api.get<any[]>(`/lotes-por-producto/${productoId}`).then(r => r.data);

/**
 * Obtener alertas de stock bajo
 */
export const getAlertasStock = (): Promise<AlertaStock[]> =>
  api.get<{ total_alertas: number; fecha_consulta: string; alertas: AlertaStock[] }>('/alertas-stock')
    .then(r => r.data.alertas || []);

/**
 * Obtener lotes próximos a vencer
 * @param dias - Rango de días a verificar (default: 7)
 */
export const getLotesProximosVencer = (dias: number = 7): Promise<LoteProximoVencer[]> =>
  api.get<{ dias_rango: number; fecha_consulta: string; total_lotes: number; lotes: LoteProximoVencer[] }>(
    `/lotes-proximos-vencer?dias=${dias}`
  ).then(r => r.data.lotes || []);
export const updateLote = (id: number, data: any) =>
  api.put(`/lotes-materia-prima/${id}`, data).then(r => r.data);
