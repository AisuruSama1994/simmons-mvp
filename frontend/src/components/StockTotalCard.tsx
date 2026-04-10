import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, TrendingDown } from 'lucide-react';
import { getStockTotal } from '../../services/materiasPrimas';
import type { StockTotal } from '../../types/materia_prima';

interface StockTotalCardProps {
    refresh?: boolean;
}

export default function StockTotalCard({ refresh }: StockTotalCardProps) {
    const [stocks, setStocks] = useState<StockTotal[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargar();
    }, [refresh]);

    const cargar = async () => {
        try {
            const data = await getStockTotal();
            setStocks(data);
        } catch (error) {
            console.error('Error cargando stock total:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (estado: string) => {
        switch (estado) {
            case 'OK':
                return 'bg-green-50 border-green-200';
            case 'BAJO':
                return 'bg-yellow-50 border-yellow-200';
            case 'ALERTA':
                return 'bg-orange-50 border-orange-200';
            case 'VENCIDO':
                return 'bg-red-50 border-red-200';
            default:
                return 'bg-gray-50 border-gray-200';
        }
    };

    const getStatusIcon = (estado: string) => {
        switch (estado) {
            case 'OK':
                return <CheckCircle size={18} className="text-green-600" />;
            case 'BAJO':
            case 'ALERTA':
                return <AlertTriangle size={18} className="text-orange-600" />;
            case 'VENCIDO':
                return <AlertTriangle size={18} className="text-red-600" />;
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
                ))}
            </div>
        );
    }

    if (stocks.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <TrendingDown size={32} className="mx-auto mb-2 opacity-50" />
                <p>Sin stock registrado</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stocks.map((stock) => (
                <div
                    key={stock.producto_id}
                    className={`border rounded-lg p-4 ${getStatusColor(stock.estado_stock)}`}
                >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                            <h3 className="font-semibold text-sm text-gray-800">
                                {stock.producto_nombre}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                                {stock.cantidad_lotes} lote{stock.cantidad_lotes !== 1 ? 's' : ''}
                            </p>
                        </div>
                        {getStatusIcon(stock.estado_stock)}
                    </div>

                    {/* Stock Info */}
                    <div className="space-y-2 border-t border-current border-opacity-10 pt-3">
                        <div className="flex justify-between items-baseline">
                            <span className="text-xs text-gray-600">Stock actual:</span>
                            <span className="font-bold text-lg">
                                {stock.stock_total.toFixed(1)} {stock.unidad_abreviacion}
                            </span>
                        </div>
                        <div className="flex justify-between items-baseline">
                            <span className="text-xs text-gray-600">Stock mín:</span>
                            <span className="text-sm text-gray-600">
                                {stock.stock_minimo} {stock.unidad_abreviacion}
                            </span>
                        </div>

                        {/* Progress bar */}
                        <div className="mt-3">
                            <div className="w-full bg-gray-300 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full transition-all ${stock.estado_stock === 'OK'
                                            ? 'bg-green-500'
                                            : stock.estado_stock === 'BAJO'
                                                ? 'bg-yellow-500'
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
                    </div>

                    {/* Status badge */}
                    <div className="mt-3 pt-3 border-t border-current border-opacity-10">
                        <span
                            className={`inline-block text-xs font-semibold px-2 py-1 rounded ${stock.estado_stock === 'OK'
                                    ? 'bg-green-200 text-green-800'
                                    : stock.estado_stock === 'BAJO'
                                        ? 'bg-yellow-200 text-yellow-800'
                                        : stock.estado_stock === 'ALERTA'
                                            ? 'bg-orange-200 text-orange-800'
                                            : 'bg-red-200 text-red-800'
                                }`}
                        >
                            {stock.estado_stock}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}