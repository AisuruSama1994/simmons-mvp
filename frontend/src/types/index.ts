// ─── Entidades base ────────────────────────────────────────────

export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
}

export interface UnidadMedida {
  id: number;
  nombre: string;
  abreviatura: string;
}

export interface Proveedor {
  id: number;
  nombre: string;
  contacto?: string;
  telefono?: string;
  email?: string;
  activo: boolean;
  created_at: string;
}

// ─── Materia Prima ─────────────────────────────────────────────

export interface ProductoMateriaPrima {
  id: number;
  nombre: string;
  descripcion?: string;
  categoria_id?: number;
  proveedor_id?: number;
  unidad_medida_id?: number;
  precio_por_unidad: number;
  stock_minimo: number;
  activo: boolean;
  created_at: string;
  categoria?: Categoria;
  unidad_medida?: UnidadMedida;
  proveedor?: Proveedor;
}

export interface ProductoMateriaPrimaCreate {
  nombre: string;
  descripcion?: string;
  categoria_id?: number;
  proveedor_id?: number;
  unidad_medida_id?: number;
  precio_por_unidad?: number;
  stock_minimo?: number;
}

export interface LoteMateriaPrima {
  id: number;
  numero_lote: string;
  producto_materia_prima_id: number;
  cantidad_inicial: number;
  cantidad_disponible: number;
  unidad_medida_id?: number;
  precio_compra: number;
  fecha_compra?: string;
  fecha_vencimiento?: string;
  proveedor_id?: number;
  estado: 'disponible' | 'agotado' | 'vencido';
  notas?: string;
  created_at: string;
  producto_materia_prima?: ProductoMateriaPrima;
}

export interface LoteCreate {
  numero_lote: string;
  producto_materia_prima_id: number;
  cantidad_inicial: number;
  cantidad_disponible: number;
  unidad_medida_id?: number;
  precio_compra?: number;
  fecha_compra?: string;
  fecha_vencimiento?: string;
  proveedor_id?: number;
  notas?: string;
}

// ─── Recetas ───────────────────────────────────────────────────

export interface RecetaIngrediente {
  id: number;
  producto_materia_prima_id: number;
  cantidad: number;
  unidad_medida_id?: number;
  notas?: string;
}

export interface Receta {
  id: number;
  nombre: string;
  descripcion?: string;
  rendimiento_unidades: number;
  tiempo_preparacion_min: number;
  instrucciones?: string;
  activo: boolean;
  created_at: string;
  ingredientes: RecetaIngrediente[];
}

export interface RecetaCreate {
  nombre: string;
  descripcion?: string;
  rendimiento_unidades?: number;
  tiempo_preparacion_min?: number;
  instrucciones?: string;
  ingredientes: { producto_materia_prima_id: number; cantidad: number; unidad_medida_id?: number }[];
}

// ─── Productos ─────────────────────────────────────────────────

export interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  receta_id?: number;
  precio_venta: number;
  unidad_venta: string;
  activo: boolean;
  created_at: string;
}

export interface ProductoCreate {
  nombre: string;
  descripcion?: string;
  receta_id?: number;
  precio_venta?: number;
  unidad_venta?: string;
}

export interface InventarioProducto {
  id: number;
  producto_id: number;
  stock_bueno: number;
  stock_defectuoso: number;
  stock_total: number;
  updated_at: string;
}

// ─── Producción ────────────────────────────────────────────────

export type EstadoOrden = 'pendiente' | 'en_proceso' | 'completada' | 'cancelada';

export interface OrdenProduccion {
  id: number;
  numero_orden: string;
  receta_id: number;
  cantidad_planificada: number;
  cantidad_producida: number;
  estado: EstadoOrden;
  fecha_planificada?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  notas?: string;
  created_at: string;
}

export interface OrdenCreate {
  receta_id: number;
  cantidad_planificada: number;
  fecha_planificada?: string;
  notas?: string;
}

// ─── Ventas ────────────────────────────────────────────────────

export interface VentaItem {
  id: number;
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface Venta {
  id: number;
  numero_venta: string;
  estado: 'completada' | 'anulada' | 'pendiente';
  subtotal: number;
  descuento: number;
  total: number;
  metodo_pago: string;
  notas?: string;
  created_at: string;
  items: VentaItem[];
}

export interface VentaCreate {
  items: { producto_id: number; cantidad: number; precio_unitario: number }[];
  descuento?: number;
  metodo_pago?: string;
  notas?: string;
}

// ─── Reportes / Dashboard ──────────────────────────────────────

export interface DashboardData {
  ventas_hoy: number;
  ventas_mes: number;
  num_ventas_hoy: number;
  ordenes_activas: number;
  productos_con_stock: number;
  lotes_proximos_vencer: number;
}

export interface VentaPorDia {
  fecha: string;
  total: number;
  cantidad: number;
}

export interface ProductoMasVendido {
  nombre: string;
  total_vendido: number;
  total_facturado: number;
}

export interface AlertaStock {
  id: number;
  nombre: string;
  stock_minimo: number;
  stock_actual: number;
  deficit: number;
}
