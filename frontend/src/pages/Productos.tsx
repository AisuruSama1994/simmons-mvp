import { useEffect, useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import Modal from '../components/common/Modal';
import { getProductos, createProducto } from '../services/productos';
import { getRecetas } from '../services/recetas';
import type { Producto, Receta } from '../types';

export default function Productos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ nombre: '', descripcion: '', precio_venta: 0, unidad_venta: 'unidad', receta_id: '' });

  const load = () => {
    setLoading(true);
    Promise.all([getProductos(), getRecetas()])
      .then(([p, r]) => { setProductos(p); setRecetas(r); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createProducto({
      nombre: form.nombre,
      descripcion: form.descripcion,
      precio_venta: Number(form.precio_venta),
      unidad_venta: form.unidad_venta,
      receta_id: form.receta_id ? Number(form.receta_id) : undefined,
    });
    setModal(false);
    load();
  };

  return (
    <div className="page">
      <div className="page-actions">
        <div />
        <div className="btn-group">
          <button className="btn btn--ghost" onClick={load}><RefreshCw size={16} /></button>
          <button className="btn btn--primary" onClick={() => setModal(true)}><Plus size={16} /> Nuevo Producto</button>
        </div>
      </div>

      {loading ? <div className="loading-screen"><div className="spinner" /></div> : (
        <div className="productos-grid">
          {productos.length === 0 && <p className="empty-state">No hay productos. ¡Creá el primero!</p>}
          {productos.map(p => (
            <div key={p.id} className="producto-card">
              <div className="producto-icon">🍞</div>
              <div className="producto-body">
                <h3 className="producto-nombre">{p.nombre}</h3>
                {p.descripcion && <p className="producto-desc">{p.descripcion}</p>}
                <div className="producto-footer">
                  <span className="producto-precio">${p.precio_venta.toFixed(2)}</span>
                  <span className="badge badge--neutral">{p.unidad_venta}</span>
                  {p.receta_id && <span className="badge badge--blue">Receta #{p.receta_id}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Nuevo Producto">
        <form onSubmit={handleCreate} className="form-grid">
          <label className="form-field"><span>Nombre *</span><input required value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} /></label>
          <label className="form-field"><span>Descripción</span><input value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))} /></label>
          <label className="form-field"><span>Precio de venta</span><input type="number" step="0.01" min="0" value={form.precio_venta} onChange={e => setForm(p => ({ ...p, precio_venta: Number(e.target.value) }))} /></label>
          <label className="form-field"><span>Unidad de venta</span>
            <select value={form.unidad_venta} onChange={e => setForm(p => ({ ...p, unidad_venta: e.target.value }))}>
              <option value="unidad">Unidad</option>
              <option value="docena">Docena</option>
              <option value="kg">Kg</option>
              <option value="g">Gramo</option>
            </select>
          </label>
          <label className="form-field"><span>Receta asociada</span>
            <select value={form.receta_id} onChange={e => setForm(p => ({ ...p, receta_id: e.target.value }))}>
              <option value="">Sin receta</option>
              {recetas.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
            </select>
          </label>
          <div className="form-actions">
            <button type="button" className="btn btn--ghost" onClick={() => setModal(false)}>Cancelar</button>
            <button type="submit" className="btn btn--primary">Guardar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
