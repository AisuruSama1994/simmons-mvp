import { useEffect, useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import Modal from '../components/common/Modal';
import { getMateriasPrimas, createMateriaPrima, getLotes, createLote, getCategorias, getUnidades, getProveedores } from '../services/materiasPrimas';
import type { ProductoMateriaPrima, LoteMateriaPrima, Categoria, UnidadMedida, Proveedor } from '../types';

export default function Inventario() {
  const [materias, setMaterias] = useState<ProductoMateriaPrima[]>([]);
  const [lotes, setLotes] = useState<LoteMateriaPrima[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [unidades, setUnidades] = useState<UnidadMedida[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [tab, setTab] = useState<'materias' | 'lotes'>('materias');
  const [modalMP, setModalMP] = useState(false);
  const [modalLote, setModalLote] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formMP, setFormMP] = useState({ nombre: '', descripcion: '', precio_por_unidad: 0, stock_minimo: 0, categoria_id: '', unidad_medida_id: '', proveedor_id: '' });
  const [formLote, setFormLote] = useState({ numero_lote: '', producto_materia_prima_id: '', cantidad_inicial: 0, cantidad_disponible: 0, precio_compra: 0, fecha_compra: '', fecha_vencimiento: '' });

  const load = () => {
    setLoading(true);
    Promise.all([getMateriasPrimas(), getLotes(), getCategorias(), getUnidades(), getProveedores()])
      .then(([mps, ls, cats, unds, provs]) => {
        setMaterias(mps); setLotes(ls); setCategorias(cats); setUnidades(unds); setProveedores(provs);
      }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreateMP = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMateriaPrima({
      ...formMP,
      precio_por_unidad: Number(formMP.precio_por_unidad),
      stock_minimo: Number(formMP.stock_minimo),
      categoria_id: formMP.categoria_id ? Number(formMP.categoria_id) : undefined,
      unidad_medida_id: formMP.unidad_medida_id ? Number(formMP.unidad_medida_id) : undefined,
      proveedor_id: formMP.proveedor_id ? Number(formMP.proveedor_id) : undefined,
    });
    setModalMP(false);
    load();
  };

  const handleCreateLote = async (e: React.FormEvent) => {
    e.preventDefault();
    await createLote({
      numero_lote: formLote.numero_lote,
      producto_materia_prima_id: Number(formLote.producto_materia_prima_id),
      cantidad_inicial: Number(formLote.cantidad_inicial),
      cantidad_disponible: Number(formLote.cantidad_inicial),
      precio_compra: Number(formLote.precio_compra),
      fecha_compra: formLote.fecha_compra || undefined,
      fecha_vencimiento: formLote.fecha_vencimiento || undefined,
    });
    setModalLote(false);
    load();
  };

  return (
    <div className="page">
      <div className="page-actions">
        <div className="tabs">
          <button className={`tab ${tab === 'materias' ? 'tab--active' : ''}`} onClick={() => setTab('materias')}>Materias Primas</button>
          <button className={`tab ${tab === 'lotes' ? 'tab--active' : ''}`} onClick={() => setTab('lotes')}>Lotes</button>
        </div>
        <div className="btn-group">
          <button className="btn btn--ghost" onClick={load}><RefreshCw size={16} /></button>
          {tab === 'materias' && <button className="btn btn--primary" onClick={() => setModalMP(true)}><Plus size={16} /> Nueva Materia Prima</button>}
          {tab === 'lotes' && <button className="btn btn--primary" onClick={() => setModalLote(true)}><Plus size={16} /> Registrar Lote</button>}
        </div>
      </div>

      {loading ? <div className="loading-screen"><div className="spinner" /></div> : (

        tab === 'materias' ? (
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Nombre</th><th>Categoría</th><th>Unidad</th><th>Precio/ud</th><th>Stock mín.</th></tr></thead>
              <tbody>
                {materias.length === 0 && <tr><td colSpan={5} className="td-empty">Sin materias primas</td></tr>}
                {materias.map(m => (
                  <tr key={m.id}>
                    <td><strong>{m.nombre}</strong><br /><small className="text-muted">{m.descripcion}</small></td>
                    <td>{m.categoria?.nombre || '—'}</td>
                    <td>{m.unidad_medida?.abreviatura || '—'}</td>
                    <td>${m.precio_por_unidad.toFixed(2)}</td>
                    <td>{m.stock_minimo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Nro. Lote</th><th>Materia Prima</th><th>Disponible</th><th>Precio</th><th>Vencimiento</th><th>Estado</th></tr></thead>
              <tbody>
                {lotes.length === 0 && <tr><td colSpan={6} className="td-empty">Sin lotes registrados</td></tr>}
                {lotes.map(l => (
                  <tr key={l.id}>
                    <td><code>{l.numero_lote}</code></td>
                    <td>{l.producto_materia_prima?.nombre || `ID ${l.producto_materia_prima_id}`}</td>
                    <td>{l.cantidad_disponible} / {l.cantidad_inicial}</td>
                    <td>${l.precio_compra.toFixed(2)}</td>
                    <td>{l.fecha_vencimiento || '—'}</td>
                    <td><span className={`badge badge--${l.estado}`}>{l.estado}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Modal nueva materia prima */}
      <Modal open={modalMP} onClose={() => setModalMP(false)} title="Nueva Materia Prima">
        <form onSubmit={handleCreateMP} className="form-grid">
          <label className="form-field">
            <span>Nombre *</span>
            <input required value={formMP.nombre} onChange={e => setFormMP(p => ({ ...p, nombre: e.target.value }))} />
          </label>
          <label className="form-field">
            <span>Descripción</span>
            <input value={formMP.descripcion} onChange={e => setFormMP(p => ({ ...p, descripcion: e.target.value }))} />
          </label>
          <label className="form-field">
            <span>Categoría</span>
            <select value={formMP.categoria_id} onChange={e => setFormMP(p => ({ ...p, categoria_id: e.target.value }))}>
              <option value="">Sin categoría</option>
              {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </label>
          <label className="form-field">
            <span>Unidad de medida</span>
            <select value={formMP.unidad_medida_id} onChange={e => setFormMP(p => ({ ...p, unidad_medida_id: e.target.value }))}>
              <option value="">Sin unidad</option>
              {unidades.map(u => <option key={u.id} value={u.id}>{u.nombre} ({u.abreviatura})</option>)}
            </select>
          </label>
          <label className="form-field">
            <span>Proveedor</span>
            <select value={formMP.proveedor_id} onChange={e => setFormMP(p => ({ ...p, proveedor_id: e.target.value }))}>
              <option value="">Sin proveedor</option>
              {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </label>
          <label className="form-field">
            <span>Precio por unidad</span>
            <input type="number" step="0.01" value={formMP.precio_por_unidad} onChange={e => setFormMP(p => ({ ...p, precio_por_unidad: Number(e.target.value) }))} />
          </label>
          <label className="form-field">
            <span>Stock mínimo</span>
            <input type="number" step="0.01" value={formMP.stock_minimo} onChange={e => setFormMP(p => ({ ...p, stock_minimo: Number(e.target.value) }))} />
          </label>
          <div className="form-actions">
            <button type="button" className="btn btn--ghost" onClick={() => setModalMP(false)}>Cancelar</button>
            <button type="submit" className="btn btn--primary">Guardar</button>
          </div>
        </form>
      </Modal>

      {/* Modal nuevo lote */}
      <Modal open={modalLote} onClose={() => setModalLote(false)} title="Registrar Lote">
        <form onSubmit={handleCreateLote} className="form-grid">
          <label className="form-field">
            <span>Número de lote *</span>
            <input required value={formLote.numero_lote} onChange={e => setFormLote(p => ({ ...p, numero_lote: e.target.value }))} />
          </label>
          <label className="form-field">
            <span>Materia Prima *</span>
            <select required value={formLote.producto_materia_prima_id} onChange={e => setFormLote(p => ({ ...p, producto_materia_prima_id: e.target.value }))}>
              <option value="">Seleccionar...</option>
              {materias.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
            </select>
          </label>
          <label className="form-field">
            <span>Cantidad *</span>
            <input type="number" step="0.01" required value={formLote.cantidad_inicial} onChange={e => setFormLote(p => ({ ...p, cantidad_inicial: Number(e.target.value) }))} />
          </label>
          <label className="form-field">
            <span>Precio de compra</span>
            <input type="number" step="0.01" value={formLote.precio_compra} onChange={e => setFormLote(p => ({ ...p, precio_compra: Number(e.target.value) }))} />
          </label>
          <label className="form-field">
            <span>Fecha de compra</span>
            <input type="date" value={formLote.fecha_compra} onChange={e => setFormLote(p => ({ ...p, fecha_compra: e.target.value }))} />
          </label>
          <label className="form-field">
            <span>Fecha de vencimiento</span>
            <input type="date" value={formLote.fecha_vencimiento} onChange={e => setFormLote(p => ({ ...p, fecha_vencimiento: e.target.value }))} />
          </label>
          <div className="form-actions">
            <button type="button" className="btn btn--ghost" onClick={() => setModalLote(false)}>Cancelar</button>
            <button type="submit" className="btn btn--primary">Guardar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
