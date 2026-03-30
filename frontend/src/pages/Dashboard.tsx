import { useEffect, useState } from 'react';
import StatCard from '../components/common/StatCard';
import { getDashboard, getVentasPorDia, getProductosMasVendidos, getAlertasStock } from '../services/reportes';
import type { DashboardData, VentaPorDia, ProductoMasVendido, AlertaStock } from '../types';
import { AlertTriangle, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [ventasDia, setVentasDia] = useState<VentaPorDia[]>([]);
  const [masVendidos, setMasVendidos] = useState<ProductoMasVendido[]>([]);
  const [alertas, setAlertas] = useState<AlertaStock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getDashboard(),
      getVentasPorDia(7),
      getProductosMasVendidos(5),
      getAlertasStock(),
    ]).then(([dash, dias, vendidos, alts]) => {
      setData(dash);
      setVentasDia(dias);
      setMasVendidos(vendidos);
      setAlertas(alts);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  const maxVenta = Math.max(...ventasDia.map(v => v.total), 1);

  return (
    <div className="page">
      {/* KPIs */}
      <div className="stats-grid">
        <StatCard label="Ventas hoy"       value={`$${(data?.ventas_hoy || 0).toFixed(2)}`}  icon="💰" color="green"  sub={`${data?.num_ventas_hoy || 0} transacciones`} />
        <StatCard label="Ventas del mes"   value={`$${(data?.ventas_mes  || 0).toFixed(2)}`}  icon="📈" color="blue"   />
        <StatCard label="Órdenes activas"  value={data?.ordenes_activas  || 0}                icon="🏭" color="amber"  />
        <StatCard label="Productos en stock" value={data?.productos_con_stock || 0}           icon="📦" color="purple" />
        <StatCard label="Lotes por vencer" value={data?.lotes_proximos_vencer || 0}           icon="⚠️" color="red"    sub="próximos 7 días" />
      </div>

      <div className="dashboard-grid">
        {/* Gráfico de ventas últimos 7 días */}
        <div className="card">
          <div className="card-header">
            <TrendingUp size={18} />
            <h3>Ventas — últimos 7 días</h3>
          </div>
          <div className="bar-chart">
            {ventasDia.length === 0 ? (
              <p className="empty-text">Sin datos aún</p>
            ) : (
              ventasDia.map(v => (
                <div key={v.fecha} className="bar-item">
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{ height: `${(v.total / maxVenta) * 100}%` }}
                    />
                  </div>
                  <div className="bar-label">{v.fecha.slice(5)}</div>
                  <div className="bar-value">${v.total.toFixed(0)}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Más vendidos */}
        <div className="card">
          <div className="card-header">
            <span>🏆</span>
            <h3>Productos más vendidos</h3>
          </div>
          {masVendidos.length === 0 ? (
            <p className="empty-text">Sin ventas registradas</p>
          ) : (
            <div className="rank-list">
              {masVendidos.map((p, i) => (
                <div key={p.nombre} className="rank-item">
                  <span className="rank-pos">#{i + 1}</span>
                  <span className="rank-name">{p.nombre}</span>
                  <span className="rank-val">{p.total_vendido} uds</span>
                  <span className="rank-money">${p.total_facturado.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Alertas de stock */}
        {alertas.length > 0 && (
          <div className="card card--alert">
            <div className="card-header">
              <AlertTriangle size={18} className="text-red" />
              <h3>Stock bajo — Materia Prima</h3>
            </div>
            <div className="alert-list">
              {alertas.map(a => (
                <div key={a.id} className="alert-item">
                  <span className="alert-name">{a.nombre}</span>
                  <div className="alert-nums">
                    <span className="alert-actual">{a.stock_actual.toFixed(1)}</span>
                    <span className="alert-sep">/</span>
                    <span className="alert-min">mín {a.stock_minimo}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
