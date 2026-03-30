import { useEffect, useState } from 'react';
import { Plus, RefreshCw, Play, CheckCircle, XCircle } from 'lucide-react';
import Modal from '../components/common/Modal';
import { getOrdenes, createOrden, iniciarOrden, completarOrden, cancelarOrden } from '../services/produccion';
import { getRecetas } from '../services/recetas';
import { getProductos } from '../services/productos';
import type { OrdenProduccion, Receta, Producto, EstadoOrden } from '../types';

const estadoColor: Record<EstadoOrden, string> = {
  pendiente: 'badge--amber',
  en_proceso: 'badge--blue',
  completada: 'badge--green',
  cancelada: 'badge--red',
};

export default function Produccion() {
  const [ordenes, setOrdenes] = useState<OrdenProduccion[]>([]);
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [modal, setModal] = useState(false);
  const [modalCompletar, setModalCompletar] = useState<OrdenProduccion | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<EstadoOrden | 'todas'>('todas');

  const [form, setForm] = useState({ receta_id: '', cantidad_planificada: 1, fecha_planificada: '', notas: '' });
  const [completarForm, setCompletarForm] = useState({ cantidad_producida: 0, producto_id: '' });

  const load = () => {
    setLoading(true);
    Promise.all([getOrdenes(), getRecetas(), getProductos()])
      .then(([o, r, p]) => { setOrdenes(o); setRecetas(r); setProductos(p); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createOrden({ receta_id: Number(form.receta_id), cantidad_planificada: Number(form.cantidad_planificada), fecha_planificada: form.fecha_planificada || undefined, notas: form.notas || undefined });
    setModal(false);
    load();
  };

  const handleCompletar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalCompletar) return;
    await completarOrden(modalCompletar.id, Number(completarForm.cantidad_producida), completarForm.producto_id ? Number(completarForm.producto_id) : undefined);
    setModalCompletar(null);
    load();
  };

  const ordenesFiltradas = filtro === 'todas' ? ordenes : ordenes.filter(o => o.estado === filtro);

  return (
    <div className="page">
      <div className="page-actions">
        <div className="tabs">
          {(['todas', 'pendiente', 'en_proceso', 'completada', 'cancelada'] as const).map(f => (
            <button key={f} className={`tab ${filtro === f ? 'tab--active' : ''}`} onClick={() => setFiltro(f)}>
              {f === 'todas' ? 'Todas' : f.replace('_', ' ')}
            </button>
          ))}
        </div>
        <div className="btn-group">
          <button className="btn btn--ghost" onClick={load}><RefreshCw size={16} /></button>
          <button className="btn btn--primary" onClick={() => setModal(true)}><Plus size={16} /> Nueva Orden</button>
        </div>
      </div>

      {loading ? <div className="loading-screen"><div className="spinner" /></div> : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Nro. Orden</th><th>Receta</th><th>Planificado</th><th>Producido</th><th>Estado</th><th>Fecha</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {ordenesFiltradas.length === 0 && <tr><td colSpan={7} className="td-empty">Sin órdenes</td></tr>}
              {ordenesFiltradas.map(o => (
                <tr key={o.id}>
                  <td><code>{o.numero_orden}</code></td>
                  <td>{recetas.find(r => r.id === o.receta_id)?.nombre || `Receta #${o.receta_id}`}</td>
                  <td>{o.cantidad_planificada}</td>
                  <td>{o.cantidad_producida}</td>
                  <td><span className={`badge ${estadoColor[o.estado]}`}>{o.estado.replace('_', ' ')}</span></td>
                  <td>{o.fecha_planificada || '—'}</td>
                  <td>
                    <div className="btn-group">
                      {o.estado === 'pendiente'   && <button className="btn btn--sm btn--ghost" title="Iniciar"   onClick={async () => { await iniciarOrden(o.id); load(); }}><Play size={14} /></button>}
                      {o.estado === 'en_proceso'  && <button className="btn btn--sm btn--green" title="Completar" onClick={() => { setModalCompletar(o); setCompletarForm({ cantidad_producida: o.cantidad_planificada, producto_id: '' }); }}><CheckCircle size={14} /></button>}
                      {['pendiente','en_proceso'].includes(o.estado) && <button className="btn btn--sm btn--danger-ghost" title="Cancelar" onClick={async () => { await cancelarOrden(o.id); load(); }}><XCircle size={14} /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Nueva Orden de Producción">
        <form onSubmit={handleCreate} className="form-grid">
          <label className="form-field"><span>Receta *</span>
            <select required value={form.receta_id} onChange={e => setForm(p => ({ ...p, receta_id: e.target.value }))}>
              <option value="">Seleccionar...</option>
              {recetas.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
            </select>
          </label>
          <label className="form-field"><span>Cantidad planificada *</span>
            <input type="number" min="1" required value={form.cantidad_planificada} onChange={e => setForm(p => ({ ...p, cantidad_planificada: Number(e.target.value) }))} />
          </label>
          <label className="form-field"><span>Fecha planificada</span>
            <input type="date" value={form.fecha_planificada} onChange={e => setForm(p => ({ ...p, fecha_planificada: e.target.value }))} />
          </label>
          <label className="form-field"><span>Notas</span>
            <textarea rows={2} value={form.notas} onChange={e => setForm(p => ({ ...p, notas: e.target.value }))} />
          </label>
          <div className="form-actions">
            <button type="button" className="btn btn--ghost" onClick={() => setModal(false)}>Cancelar</button>
            <button type="submit" className="btn btn--primary">Crear Orden</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!modalCompletar} onClose={() => setModalCompletar(null)} title="Completar Orden">
        <form onSubmit={handleCompletar} className="form-grid">
          <label className="form-field"><span>Cantidad producida *</span>
            <input type="number" min="0" step="0.01" required value={completarForm.cantidad_producida} onChange={e => setCompletarForm(p => ({ ...p, cantidad_producida: Number(e.target.value) }))} />
          </label>
          <label className="form-field"><span>Producto a acreditar al inventario</span>
            <select value={completarForm.producto_id} onChange={e => setCompletarForm(p => ({ ...p, producto_id: e.target.value }))}>
              <option value="">Sin acreditar inventario</option>
              {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </label>
          <div className="form-actions">
            <button type="button" className="btn btn--ghost" onClick={() => setModalCompletar(null)}>Cancelar</button>
            <button type="submit" className="btn btn--green">Completar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
