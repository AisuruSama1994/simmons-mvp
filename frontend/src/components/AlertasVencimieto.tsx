import { useEffect, useState } from 'react';
import { AlertTriangle, Calendar, Package } from 'lucide-react';
import { getLotesProximosVencer } from '../../services/materiasPrimas';
import type { LoteProximoVencer } from '../../types/materia_prima';

interface AlertasVencimientoProps {
    dias?: number;
    refresh?: boolean;
}

export default function AlertasVencimiento({ dias = 7, refresh }: AlertasVencimientoProps) {
    const [lotes, setLotes] = useState<LoteProximoVencer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargar();
    }, [dias, refresh]);

    const cargar = async () => {
        try {
            const data = await getLotesProximosVencer(dias);
            setLotes(data);
        } catch (error) {
            console.error('Error cargando lotes próximos a vencer:', error);
        } finally {
            setLoading(false);
        }
    };

    const getColorPorDias = (diasParaVencer: number) => {
        if (diasParaVencer < 0) return 'border-red-400 bg-red-50';
        if (diasParaVencer === 0) return 'border-orange-400 bg-orange-50';
        if (diasParaVencer <= 3) return 'border-yellow-400 bg-yellow-50';
        return 'border-blue-400 bg-blue-50';
    };

    const getEtiqueta = (diasParaVencer: number) => {
        if (diasParaVencer < 0) return `VENCIDO hace ${Math.abs(diasParaVencer)} días`;
        if (diasParaVencer === 0) return 'VENCE HOY';
        if (diasParaVencer === 1) return 'VENCE MAÑANA';
        return `Vence en ${diasParaVencer} días`;
    };

    const getColorEtiqueta = (diasParaVencer: number) => {
        if (diasParaVencer < 0) return 'bg-red-200 text-red-800';
        if (diasParaVencer === 0) return 'bg-orange-200 text-orange-800';
        if (diasParaVencer <= 3) return 'bg-yellow-200 text-yellow-800';
        return 'bg-blue-200 text-blue-800';
    };

    if (loading) {
        return (
            <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded-lg animate-pulse" />
                ))}
            </div>
        );
    }

    if (lotes.length === 0) {
        return (
            <div className="text-center py-8 bg-green-50 border border-green-200 rounded-lg">
                <Package size={32} className="mx-auto mb-2 text-green-600" />
                <p className="text-green-800 font-medium">
                    ✓ Sin lotes próximos a vencer en los próximos {dias} días
                </p>
            </div>
        );
    }

    // Ordenar por días para vencer
    const lotesOrdenados = [...lotes].sort((a, b) => a.dias_para_vencer - b.dias_para_vencer);

    return (
        <div className="space-y-2">
            {lotesOrdenados.map((lote, idx) => (
                <div
                    key={`${lote.lote_id}-${idx}`}
                    className={`border-l-4 rounded-lg p-4 ${getColorPorDias(lote.dias_para_vencer)}`}
                >
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <AlertTriangle size={16} className="flex-shrink-0" />
                                <h4 className="font-semibold text-sm">
                                    {lote.producto_nombre}
                                </h4>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mt-2 ml-6">
                                <div>
                                    <span className="text-gray-500">Cantidad:</span>
                                    <p className="font-medium text-gray-800">
                                        {lote.cantidad} {lote.unidad_medida}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-gray-500">Proveedor:</span>
                                    <p className="font-medium text-gray-800">
                                        {lote.proveedor || '—'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mt-2 ml-6 text-xs">
                                <Calendar size={14} className="text-gray-500" />
                                <span className="text-gray-600">
                                    {new Date(lote.fecha_vencimiento).toLocaleDateString('es-AR', {
                                        weekday: 'short',
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                    })}
                                </span>
                            </div>
                        </div>

                        {/* Badge de días para vencer */}
                        <div className="ml-4 text-right flex-shrink-0">
                            <span
                                className={`inline-block text-xs font-bold px-3 py-1 rounded whitespace-nowrap ${getColorEtiqueta(
                                    lote.dias_para_vencer
                                )}`}
                            >
                                {getEtiqueta(lote.dias_para_vencer)}
                            </span>
                        </div>
                    </div>
                </div>
            ))}

            {/* Resumen */}
            <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                <p>
                    Total: <strong>{lotes.length}</strong> lote{lotes.length !== 1 ? 's' : ''} próximo{lotes.length !== 1 ? 's' : ''} a vencer
                </p>
            </div>
        </div>
    );
}