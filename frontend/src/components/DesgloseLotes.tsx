import { useEffect, useState } from 'react';
import { Package, Trash2, Eye } from 'lucide-react';
import { getLotesPorProducto } from '../../services/materiasPrimas';
import type { DetalleLote } from '../../types/materia_prima';

interface DesgloseLotesProps {
    productoId: number;
    productoNombre: string;
}

export default function DesgloseLotes({ productoId, productoNombre }: DesgloseLotesProps) {
    const [lotes, setLotes] = useState<DetalleLote[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        cargar();
    }, [productoId]);

    const cargar = async () => {
        try {
            const data = await getLotesPorProducto(productoId);
            setLotes(data);
        } catch (error) {
            console.error('Error cargando lotes:', error);
        } finally {
            setLoading(false);
        }
    };

    const getColorEstado = (estado: string) => {
        switch (estado) {
            case 'VIGENTE':
                return 'bg-green-100 text-green-800';
            case 'PROXIMO':
                return 'bg-yellow-100 text-yellow-800';
            case 'VENCIDO':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="p-4 bg-gray-100 rounded-lg animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-3/4" />
            </div>
        );
    }

    if (lotes.length === 0) {
        return (
            <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500 text-sm">
                <Package size={16} className="inline-block mr-1 opacity-50" />
                Sin lotes registrados para este producto
            </div>
        );
    }

    const totalStock = lotes.reduce((sum, l) => sum + l.cantidad_actual, 0);

    return (
        <div className="border rounded-lg bg-white">
            {/* Header */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-3 flex-1">
                    <Package size={18} className="text-blue-600" />
                    <div className="text-left">
                        <p className="font-semibold text-sm">{productoNombre}</p>
                        <p className="text-xs text-gray-500">
                            {lotes.length} lote{lotes.length !== 1 ? 's' : ''} • Stock total:{' '}
                            <strong>{totalStock.toFixed(1)}</strong>
                        </p>
                    </div>
                </div>
                <div className={`transform transition-transform ${expanded ? 'rotate-180' : ''}`}>
                    <Eye size={18} className="text-gray-400" />
                </div>
            </button>

            {/* Detalles expandibles */}
            {expanded && (
                <div className="border-t px-4 py-3 space-y-2">
                    {lotes.map((lote) => (
                        <div key={lote.lote_id} className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                    <p className="font-semibold text-sm flex items-center gap-2">
                                        {lote.lote_numero && <code className="text-xs bg-gray-200 px-2 py-1 rounded">{lote.lote_numero}</code>}
                                        {lote.proveedor_nombre && <span className="text-xs text-gray-600">{lote.proveedor_nombre}</span>}
                                    </p>
                                </div>
                                <span
                                    className={`text-xs font-semibold px-2 py-1 rounded whitespace-nowrap ${getColorEstado(
                                        lote.estado_vencimiento
                                    )}`}
                                >
                                    {lote.estado_vencimiento}
                                </span>
                            </div>

                            {/* Presentación */}
                            {lote.cantidad_presentacion > 0 && (
                                <p className="text-xs text-gray-600 mb-2">
                                    <strong>{lote.cantidad_presentacion}</strong> {lote.unidad_presentacion || 'unidades'} ×{' '}
                                    <strong>{lote.peso_unitario}</strong> {lote.unidad_abreviacion} = <strong>{lote.cantidad_actual}</strong>{' '}
                                    {lote.unidad_medida}
                                </p>
                            )}

                            {/* Datos de stock y precio */}
                            <div className="grid grid-cols-3 gap-2 text-xs">
                                <div>
                                    <span className="text-gray-600">Cantidad:</span>
                                    <p className="font-semibold text-gray-800">
                                        {lote.cantidad_actual} {lote.unidad_abreviacion}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-gray-600">Precio unitario:</span>
                                    <p className="font-semibold text-gray-800">${lote.precio_unitario.toFixed(2)}</p>
                                </div>
                                <div>
                                    <span className="text-gray-600">Total:</span>
                                    <p className="font-semibold text-gray-800">${lote.precio_total.toFixed(2)}</p>
                                </div>
                            </div>

                            {/* Fechas */}
                            {(lote.fecha_compra || lote.fecha_vencimiento) && (
                                <div className="grid grid-cols-2 gap-2 text-xs mt-2 pt-2 border-t border-gray-200">
                                    {lote.fecha_compra && (
                                        <div>
                                            <span className="text-gray-600">Compra:</span>
                                            <p className="font-semibold text-gray-800">
                                                {new Date(lote.fecha_compra).toLocaleDateString('es-AR')}
                                            </p>
                                        </div>
                                    )}
                                    {lote.fecha_vencimiento && (
                                        <div>
                                            <span className="text-gray-600">Vencimiento:</span>
                                            <p className="font-semibold text-gray-800">
                                                {new Date(lote.fecha_vencimiento).toLocaleDateString('es-AR')}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Código de barras */}
                            {lote.codigo_barras_lote && (
                                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                    <code className="bg-white px-1 py-0.5 rounded border border-gray-200">{lote.codigo_barras_lote}</code>
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}