import { useEffect, useState } from 'react';
import { getVentasPorDia, getProductosMasVendidos, getResumenProduccion } from '../services/reportes';
import type { VentaPorDia, ProductoMasVendido } from '../types';

export default function Reportes() {
  const [ventasDia, setVentasDia] = useState<VentaPorDia[]>([]);
  const [masVendidos, setMasVendidos] = useState<ProductoMasVendido[]>([]);
  const [produccion, setProduccion] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState(7);

  const load = () => {
    setLoading(true);
    Promise.all([getVentasPorDia(periodo), getProductosMasVendidos(10), getResumenProduccion()])
      .then(([v, mv, pr]) => { setVentasDia(v); setMasVendidos(mv); setProduccion(pr); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [periodo]);

  const maxVenta = Math.max(...ventasDia.map(v => v.total), 1);
  const totalPeriodo = ventasDia.reduce((a, v) => a + v.total, 0);
  const totalOrdenes = Object.values(produccion).reduce((a, v) => a + v, 0);

  return (
    <div className="page">
      <div className="page-actions">
        <div className="btn-group">
          {[7, 14, 30].map(d => (
            <button key={d} className={`btn btn--sm ${periodo === d ? 'btn--primary' : 'btn--ghost'}`} onClick={() => setPeriodo(d)}>
              {d} días
            </button>
          ))}
        </div>
      </div>

      {loading ? <div className="loading-screen"><div className="spinner" /></div> : (
        <div className="reportes-grid">

          {/* Ventas por día */}
          <div className="card card--wide">
            <div className="card-header">
              <span>📊</span>
              <h3>Ventas — últimos {periodo} días</h3>
              <span className="card-badge">${totalPeriodo.toFixed(2)} total</span>
            </div>
            <div className="bar-chart bar-chart--tall">
              {ventasDia.length === 0 ? (
                <p className="empty-text">Sin datos en este período</p>
              ) : ventasDia.map(v => (
                <div key={v.fecha} className="bar-item">
                  <div className="bar-val-top">${v.total.toFixed(0)}</div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ height: `${(v.total / maxVenta) * 100}%` }} />
                  </div>
                  <div className="bar-label">{v.fecha.slice(5)}</div>
                  <div className="bar-sub">{v.cantidad} vtas</div>
                </div>
              ))}
            </div>
          </div>

          {/* Más vendidos */}
          <div className="card">
            <div className="card-header"><span>🏆</span><h3>Productos más vendidos</h3></div>
            {masVendidos.length === 0 ? (
              <p className="empty-text">Sin ventas registradas</p>
            ) : (
              <div className="rank-list">
                {masVendidos.map((p, i) => (
                  <div key={p.nombre} className="rank-item">
                    <span className="rank-pos">#{i + 1}</span>
                    <span className="rank-name">{p.nombre}</span>
                    <div className="rank-right">
                      <span className="rank-val">{p.total_vendido} uds</span>
                      <span className="rank-money">${p.total_facturado.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Estado de producción */}
          <div className="card">
            <div className="card-header"><span>🏭</span><h3>Órdenes de Producción</h3><span className="card-badge">{totalOrdenes} total</span></div>
            <div className="produccion-stats">
              {Object.entries(produccion).map(([estado, cant]) => (
                <div key={estado} className="produccion-stat">
                  <span className={`badge badge--${estado === 'completada' ? 'green' : estado === 'en_proceso' ? 'blue' : estado === 'cancelada' ? 'red' : 'amber'}`}>{estado.replace('_', ' ')}</span>
                  <span className="produccion-count">{cant}</span>
                  <div className="produccion-bar">
                    <div className="produccion-bar-fill" style={{ width: `${totalOrdenes ? (cant / totalOrdenes) * 100 : 0}%` }} />
                  </div>
                </div>
              ))}
              {Object.keys(produccion).length === 0 && <p className="empty-text">Sin órdenes registradas</p>}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
