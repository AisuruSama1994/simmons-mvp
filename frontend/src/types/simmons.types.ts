// ========================================
// TIPOS TYPESCRIPT - SIMMONS MVP
// ========================================

// ---- USUARIOS & ROLES ----
export interface Usuario {
    id: number;
    nombre: string;
    email: string;
    rol_id: number;
    sucursal_id: number;
    activo: boolean;
}

export type RolType = "admin" | "gerente" | "panadero" | "barista" | "cajero";

export interface Rol {
    id: number;
    nombre: RolType;
}

// ---- MATERIA PRIMA ----
export interface UnidadMedida {
    id: number;
    nombre: string;
    abreviacion: string;
    tipo: "peso" | "volumen" | "cantidad";
}

export interface Proveedor {
    id: number;
    nombre: string;
    domicilio: string;
    telefono: string;
    celular: string;
    instagram?: string;
    activo: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface ProveedorForm {
    nombre: string;
    domicilio: string;
    telefono: string;
    celular: string;
    instagram?: string;
}

export interface CategoriaMateriaPrima {
    id: number;
    nombre: string;
}

export interface ProductoMateriaPrima {
    id: number;
    nombre: string;
    categoria_id: number;
    unidad_id: number;
    stock_minimo: number;
    activo: boolean;
    categoria?: CategoriaMateriaPrima;
    unidad?: UnidadMedida;
    created_at?: string;
}

export interface ProductoMateriaPrimaForm {
    nombre: string;
    categoria_id: number;
    unidad_id: number;
    stock_minimo: number;
}

export interface LoteMateriaPrima {
    id: number;
    producto_id: number;
    proveedor_id: number;
    cantidad: number;
    precio_unitario: number;
    fecha_compra: string;
    fecha_vencimiento: string;
    numero_lote: string;
    estado: "abierto" | "vencido" | "agotado";
    producto?: ProductoMateriaPrima;
    proveedor?: Proveedor;
    created_at?: string;
}

export interface LoteMateriaPrimaForm {
    producto_id: number;
    proveedor_id: number;
    cantidad: number;
    precio_unitario: number;
    fecha_compra: string;
    fecha_vencimiento: string;
    numero_lote: string;
}

// ---- RECETAS ----
export interface RecetaIngrediente {
    id: number;
    receta_id: number;
    producto_materia_prima_id: number;
    cantidad_requerida: number;
    unidad_id: number;
    producto?: ProductoMateriaPrima;
    unidad?: UnidadMedida;
}

export interface Receta {
    id: number;
    nombre: string;
    tipo: string; // "medialunas", "facturas", "torta", etc
    precio_venta: number;
    rendimiento: number; // cuántas unidades da
    activa: boolean;
    ingredientes?: RecetaIngrediente[];
    created_at?: string;
}

export interface RecetaForm {
    nombre: string;
    tipo: string;
    precio_venta: number;
    rendimiento: number;
    ingredientes: Array<{
        producto_materia_prima_id: number;
        cantidad_requerida: number;
        unidad_id: number;
    }>;
}

// ---- PRODUCTOS (FINISHED GOODS) ----
export interface Producto {
    id: number;
    nombre: string;
    receta_id: number;
    precio_venta: number;
    activo: boolean;
    receta?: Receta;
    created_at?: string;
}

export interface ProductoForm {
    nombre: string;
    receta_id: number;
    precio_venta: number;
}

export interface InventarioProductoPorEstado {
    id: number;
    producto_id: number;
    estado: "cruda" | "cocida" | "congelada" | "vendida";
    cantidad_actual: number;
    ultimo_movimiento: string;
}

export interface LoteProducto {
    id: number;
    producto_id: number;
    numero_lote: string;
    cantidad_inicial: number;
    cantidad_actual: number;
    fecha_produccion: string;
    estado: "abierto" | "agotado";
}

// ---- PRODUCCIÓN ----
export interface OrdenProduccion {
    id: number;
    receta_id: number;
    cantidad_objetivo: number;
    cantidad_producida: number;
    fecha_produccion: string;
    usuario_id: number;
    estado: "planificada" | "en_produccion" | "completada";
    receta?: Receta;
    usuario?: Usuario;
    lotes_usados?: Array<{
        lote_materia_prima_id: number;
        cantidad_usada: number;
    }>;
    created_at?: string;
}

export interface OrdenProduccionForm {
    receta_id: number;
    cantidad_objetivo: number;
    lotes_a_usar: Array<{
        lote_materia_prima_id: number;
        cantidad_usada: number;
    }>;
}

export interface TransformacionProduccion {
    id: number;
    producto_id: number;
    cantidad: number;
    desde_estado: "cruda" | "cocida" | "congelada";
    hasta_estado: "cruda" | "cocida" | "congelada";
    fecha: string;
    usuario_id: number;
    notas?: string;
    producto?: Producto;
    usuario?: Usuario;
}

export interface TransformacionForm {
    producto_id: number;
    cantidad: number;
    desde_estado: "cruda" | "cocida" | "congelada";
    hasta_estado: "cruda" | "cocida" | "congelada";
    notas?: string;
}

// ---- VENTAS ----
export interface VentaItem {
    id: number;
    venta_id: number;
    producto_id: number;
    cantidad: number;
    precio_unitario: number;
    estado_producto: "cocida" | "congelada";
    orden_produccion_id?: number;
    producto?: Producto;
}

export interface Venta {
    id: number;
    fecha_hora: string;
    usuario_id: number;
    monto_total: number;
    medio_pago: "efectivo" | "tarjeta";
    notas?: string;
    items?: VentaItem[];
    usuario?: Usuario;
    created_at?: string;
}

export interface VentaForm {
    medio_pago: "efectivo" | "tarjeta";
    items: Array<{
        producto_id: number;
        cantidad: number;
        precio_unitario: number;
        estado_producto: "cocida" | "congelada";
    }>;
    notas?: string;
}

// ---- INVENTARIO ----
export interface ResumenInventario {
    producto_id: number;
    nombre: string;
    cantidad_cruda: number;
    cantidad_cocida: number;
    cantidad_congelada: number;
    total: number;
}

export interface ResumenMateriaPrima {
    producto_id: number;
    nombre: string;
    cantidad_total: number;
    unidad: string;
    stock_minimo: number;
    alerta: boolean;
}

// ---- AUDITORÍA ----
export interface MovimientoInventario {
    id: number;
    tipo: "compra" | "produccion" | "venta" | "transformacion" | "descarte";
    producto_id: number;
    cantidad: number;
    fecha: string;
    usuario_id: number;
    referencia_id?: number;
    notas?: string;
}

export interface AuditoriaCambio {
    id: number;
    tabla_afectada: string;
    registro_id: number;
    campo: string;
    valor_anterior: string;
    valor_nuevo: string;
    usuario_id: number;
    fecha: string;
    tipo: "creacion" | "actualizacion" | "eliminacion";
}

// ---- API RESPONSES ----
export interface ApiResponse<T> {
    data: T;
    success: boolean;
    message?: string;
}

export interface ApiListResponse<T> {
    items: T[];
    total: number;
    page: number;
    page_size: number;
}

// ---- DASHBOARD ----
export interface DashboardStats {
    total_productos_disponibles: number;
    total_materia_prima_valor: number;
    ordenes_pendientes: number;
    ventas_hoy: number;
    productos_bajo_stock: number;
}