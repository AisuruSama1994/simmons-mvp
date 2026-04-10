import { useEffect, useState } from 'react';
import { RefreshCw, AlertTriangle, TrendingUp, Package } from 'lucide-react';
import { getStockTotal, getAlertasStock, getLotesProximosVencer } from '../services/materiasPrimas';

interface StockTotal {
    producto_id: number;
    producto_nombre: string;
    unidad_abreviacion: string;
    stock_total: number;
    cantidad_lotes: number;
    stock_minimo: number;
    estado_stock: 'OK' | 'BAJO' | 'ALERTA' | 'VENCIDO';
}

interface AlertaStock {
    producto_id: number;
    producto_nombre: string;
    stock_actual: number;
    stock_minimo: number;
    unidad_medida: string;
    diferencia: number;
    estado: 'BAJO' | 'ALERTA';
}

interface LoteProximoVencer {
    lote_id: number;
    producto_nombre: string;
    proveedor?: string;
    cantidad: number;
    unidad_medida: string;
    fecha_vencimiento: string;
    dias_para_vencer: number;
}

export default function DashboardMateriaPrima() {
    const [stocks, setStocks] = useState<StockTotal[]>([]);
    const [alertas, setAlertas] = useState<AlertaStock[]>([]);
    const [lotes, setLotes] = useState<LoteProximoVencer[]>([]);
    const [loading, setLoading] = useState(true);
    const [diasProximos, setDiasProximos] = useState(7);

    useEffect(() => {
        cargarDatos();
    }, [diasProximos]);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const [stockData, alertasData, lotesData] = await Promise.all([
                getStockTotal().catch(() => []),
                getAlertasStock().catch(() => []),
                getLotesProximosVencer(diasProximos).catch(() => []),
            ]);

            setStocks(Array.isArray(stockData) ? stockData : []);
            setAlertas(Array.isArray(alertasData) ? alertasData : []);
            setLotes(Array.isArray(lotesData) ? lotesData : []);
        } catch (error) {
            console.error('Error cargando datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case 'OK':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'BAJO':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'ALERTA':
                return 'bg-orange-100 text-orange-800 border-orange-300';
            case 'VENCIDO':
                return 'bg-red-100 text-red-800 border-red-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="text-center">
                    <RefreshCw size={32} className="animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Cargando datos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">📦 Materia Prima</h1>
                    <p className="text-sm text-gray-500 mt-1">Stock, alertas y vencimientos</p>
                </div>
                <button
                    onClick={cargarDatos}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <RefreshCw size={18} />
                    Actualizar
                </button>
            </div>

            {/* ─── ALERTAS DE STOCK BAJO ─────────────────────── */}
            {alertas.length > 0 && (
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle size={22} className="text-orange-600" />
                        <h2 className="text-xl font-bold text-gray-800">Stock Bajo</h2>
                        <span className="ml-auto bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-semibold">
                            {alertas.length}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {alertas.map((alerta) => (
                            <div
                                key={alerta.producto_id}
                                className="border-l-4 border-orange-500 bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <h3 className="font-semibold text-gray-800 mb-3">{alerta.producto_nombre}</h3>

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Stock actual:</span>
                                        <span className="font-semibold">{alerta.stock_actual} {alerta.unidad_medida}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Stock mínimo:</span>
                                        <span className="font-semibold">{alerta.stock_minimo} {alerta.unidad_medida}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Diferencia:</span>
                                        <span className={`font-semibold ${alerta.diferencia < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                            {alerta.diferencia < 0 ? '−' : '+'}
                                            {Math.abs(alerta.diferencia)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* ─── STOCK TOTAL ──────────────────────────────── */}
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp size={22} className="text-blue-600" />
                    <h2 className="text-xl font-bold text-gray-800">Stock Total</h2>
                </div>

                {stocks.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                        <Package size={32} className="mx-auto text-gray-400 mb-2" />
                        <p className="text-gray-600">Sin materias primas registradas</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {stocks.map((stock) => (
                            <div
                                key={stock.producto_id}
                                className={`rounded-lg p-4 border-2 ${getEstadoColor(stock.estado_stock)}`}
                            >
                                <h3 className="font-semibold text-sm mb-2">{stock.producto_nombre}</h3>

                                <div className="space-y-2 text-sm mb-3">
                                    <div className="flex justify-between">
                                        <span className="opacity-75">Stock:</span>
                                        <span className="font-bold">
                                            {stock.stock_total.toFixed(1)} {stock.unidad_abreviacion}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="opacity-75">Mínimo:</span>
                                        <span className="font-bold">
                                            {stock.stock_minimo} {stock.unidad_abreviacion}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="opacity-75">Lotes:</span>
                                        <span className="font-bold">{stock.cantidad_lotes}</span>
                                    </div>
                                </div>

                                {/* Progress bar */}
                                <div className="mb-3">
                                    <div className="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
                                        <div
                                            className={`h-full transition-all ${stock.estado_stock === 'OK'
                                                    ? 'bg-green-500'
                                                    : stock.estado_stock === 'BAJO'
                                                        ? 'bg-yellow-500'
                                                        : stock.estado_stock === 'ALERTA'
                                                            ? 'bg-orange-500'
                                                            : 'bg-red-500'
                                                }`}
                                            style={{
                                                width: `${Math.min(
                                                    (stock.stock_total / Math.max(stock.stock_minimo, 1)) * 100,
                                                    100
                                                )}%`,
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="text-center">
                                    <span
                                        className={`inline-block text-xs font-bold px-3 py-1 rounded border ${getEstadoColor(
                                            stock.estado_stock
                                        )}`}
                                    >
                                        {stock.estado_stock}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* ─── LOTES PRÓXIMOS A VENCER ──────────────────── */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <AlertTriangle size={22} className="text-red-600" />
                        <h2 className="text-xl font-bold text-gray-800">Próximos a Vencer</h2>
                    </div>
                    <select
                        value={diasProximos}
                        onChange={(e) => setDiasProximos(Number(e.target.value))}
                        className="text-sm px-3 py-1 border border-gray-300 rounded-lg bg-white"
                    >
                        <option value={3}>3 días</option>
                        <option value={7}>7 días</option>
                        <option value={15}>15 días</option>
                        <option value={30}>30 días</option>
                    </select>
                </div>

                {lotes.length === 0 ? (
                    <div className="text-center py-8 bg-green-50 rounded-lg border border-green-200">
                        <Package size={32} className="mx-auto text-green-600 mb-2" />
                        <p className="text-green-800 font-medium">
                            ✓ Sin lotes próximos a vencer en los próximos {diasProximos} días
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {lotes
                            .sort((a, b) => a.dias_para_vencer - b.dias_para_vencer)
                            .map((lote) => (
                                <div
                                    key={`${lote.lote_id}`}
                                    className={`border-l-4 rounded-lg p-4 ${lote.dias_para_vencer < 0
                                            ? 'border-red-500 bg-red-50'
                                            : lote.dias_para_vencer === 0
                                                ? 'border-orange-500 bg-orange-50'
                                                : lote.dias_para_vencer <= 3
                                                    ? 'border-yellow-500 bg-yellow-50'
                                                    : 'border-blue-500 bg-blue-50'
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-800 mb-2">{lote.producto_nombre}</h4>

                                            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-2">
                                                <div>
                                                    <span>Cantidad:</span>
                                                    <p className="font-semibold text-gray-800">
                                                        {lote.cantidad} {lote.unidad_medida}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span>Proveedor:</span>
                                                    <p className="font-semibold text-gray-800">{lote.proveedor || '—'}</p>
                                                </div>
                                            </div>

                                            <p className="text-xs text-gray-600">
                                                {new Date(lote.fecha_vencimiento).toLocaleDateString('es-AR', {
                                                    weekday: 'short',
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                            </p>
                                        </div>

                                        <div className="ml-4 text-right flex-shrink-0">
                                            <span
                                                className={`inline-block text-xs font-bold px-3 py-1 rounded whitespace-nowrap border ${lote.dias_para_vencer < 0
                                                        ? 'bg-red-200 text-red-800 border-red-300'
                                                        : lote.dias_para_vencer === 0
                                                            ? 'bg-orange-200 text-orange-800 border-orange-300'
                                                            : lote.dias_para_vencer <= 3
                                                                ? 'bg-yellow-200 text-yellow-800 border-yellow-300'
                                                                : 'bg-blue-200 text-blue-800 border-blue-300'
                                                    }`}
                                            >
                                                {lote.dias_para_vencer < 0
                                                    ? `VENCIDO hace ${Math.abs(lote.dias_para_vencer)}d`
                                                    : lote.dias_para_vencer === 0
                                                        ? 'HOY'
                                                        : lote.dias_para_vencer === 1
                                                            ? 'MAÑANA'
                                                            : `${lote.dias_para_vencer}d`}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
            </section>
        </div>
    );
}