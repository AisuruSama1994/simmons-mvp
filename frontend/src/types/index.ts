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
  tipo: 'peso' | 'volumen' | 'cantidad';
}

// ─── Proveedores ───────────────────────────────────────────────

export interface Proveedor {
  id: number;
  nombre: string;
  domicilio?: string;
  telefono?: string;
  celular?: string;
  whatsapp?: string;
  email?: string;
  instagram?: string;
  facebook?: string;
  website?: string;
  notas?: string;
  activo: boolean;
  created_at: string;
  updated_at?: string;
}

export interface ProveedorCreate {
  nombre: string;
  domicilio?: string;
  telefono?: string;
  celular?: string;
  whatsapp?: string;
  email?: string;
  instagram?: string;
  facebook?: string;
  website?: string;
  notas?: string;
}

// ─── Materia Prima ─────────────────────────────────────────────

export interface ProductoMateriaPrima {
  id: number;
  nombre: string;
  marca?: string;
  presentacion?: string;
  codigo_barras?: string;
  imagen_url?: string;
  descripcion?: string;
  categoria_id?: number;
  unidad_medida_id?: number;
  stock_minimo: number;
  activo: boolean;
  created_at: string;
  categoria?: Categoria;
  unidad_medida?: UnidadMedida;
  proveedores_asociados?: ProductoProveedorPrecio[];
}

export interface ProductoMateriaPrimaCreate {
  nombre: string;
  marca?: string;
  presentacion?: string;
  codigo_barras?: string;
  descripcion?: string;
  categoria_id?: number;
  unidad_medida_id?: number;
  stock_minimo?: number;
}

// ─── Relación Producto ↔ Proveedor ────────────────────────────

export interface ProductoProveedorPrecio {
  id: number;
  producto_materia_prima_id: number;
  proveedor_id: number;
  precio_referencia?: number;
  fecha_ultima_compra?: string;
  activo: boolean;
  notas?: string;
  proveedor?: Proveedor;
  historial_precios?: HistorialPrecioProveedor[];
}

export interface ProductoProveedorPrecioCreate {
  producto_materia_prima_id: number;
  proveedor_id: number;
  precio_referencia?: number;
  notas?: string;
}

export interface HistorialPrecioProveedor {
  id: number;
  producto_proveedor_id: number;
  precio_unitario: number;
  cantidad_comprada?: number;
  fecha: string;
  lote_id?: number;
  notas?: string;
}

// ─── Lotes ─────────────────────────────────────────────────────

export interface LoteMateriaPrima {
  id: number;
  numero_lote: string;
  producto_materia_prima_id: number;
  proveedor_id?: number;
  cantidad_inicial: number;
  cantidad_disponible: number;
  precio_compra: number;
  precio_unitario?: number;
  fecha_compra?: string;
  fecha_vencimiento?: string;
  codigo_barras_lote?: string;
  estado: 'disponible' | 'agotado' | 'vencido';
  notas?: string;
  created_at: string;
  producto_materia_prima?: ProductoMateriaPrima;
  proveedor?: Proveedor;
}

export interface LoteCreate {
  numero_lote: string;
  producto_materia_prima_id: number;
  proveedor_id?: number;
  cantidad_inicial: number;
  cantidad_disponible: number;
  precio_compra?: number;
  fecha_compra?: string;
  fecha_vencimiento?: string;
  codigo_barras_lote?: string;
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

// ─── Configuración ─────────────────────────────────────────────

export interface Configuracion {
  id: number;
  clave: string;
  valor: string;
  descripcion?: string;
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

// ─── Autenticación ─────────────────────────────────────────────

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol_id: number;
  sucursal_id: number;
  activo: boolean;
}