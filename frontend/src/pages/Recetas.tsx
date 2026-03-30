import { useEffect, useState } from 'react';
import { Plus, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import Modal from '../components/common/Modal';
import { getRecetas, createReceta } from '../services/recetas';
import { getMateriasPrimas, getUnidades } from '../services/materiasPrimas';
import type { Receta, ProductoMateriaPrima, UnidadMedida } from '../types';

export default function Recetas() {
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [materias, setMaterias] = useState<ProductoMateriaPrima[]>([]);
  const [unidades, setUnidades] = useState<UnidadMedida[]>([]);
  const [modal, setModal] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    nombre: '', descripcion: '', rendimiento_unidades: 1, tiempo_preparacion_min: 0, instrucciones: '',
    ingredientes: [{ producto_materia_prima_id: '', cantidad: 0, unidad_medida_id: '' }],
  });

  const load = () => {
    setLoading(true);
    Promise.all([getRecetas(), getMateriasPrimas(), getUnidades()])
      .then(([r, m, u]) => { setRecetas(r); setMaterias(m); setUnidades(u); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const addIngrediente = () =>
    setForm(p => ({ ...p, ingredientes: [...p.ingredientes, { producto_materia_prima_id: '', cantidad: 0, unidad_medida_id: '' }] }));

  const removeIngrediente = (i: number) =>
    setForm(p => ({ ...p, ingredientes: p.ingredientes.filter((_, idx) => idx !== i) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createReceta({
      nombre: form.nombre,
      descripcion: form.descripcion,
      rendimiento_unidades: Number(form.rendimiento_unidades),
      tiempo_preparacion_min: Number(form.tiempo_preparacion_min),
      instrucciones: form.instrucciones,
      ingredientes: form.ingredientes
        .filter(i => i.producto_materia_prima_id)
        .map(i => ({
          producto_materia_prima_id: Number(i.producto_materia_prima_id),
          cantidad: Number(i.cantidad),
          unidad_medida_id: i.unidad_medida_id ? Number(i.unidad_medida_id) : undefined,
        })),
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
          <button className="btn btn--primary" onClick={() => setModal(true)}><Plus size={16} /> Nueva Receta</button>
        </div>
      </div>

      {loading ? <div className="loading-screen"><div className="spinner" /></div> : (
        <div className="recetas-grid">
          {recetas.length === 0 && <p className="empty-state">No hay recetas. ¡Creá la primera!</p>}
          {recetas.map(r => (
            <div key={r.id} className="receta-card">
              <div className="receta-header" onClick={() => setExpanded(expanded === r.id ? null : r.id)}>
                <div>
                  <h3 className="receta-title">{r.nombre}</h3>
                  <p className="receta-meta">Rinde {r.rendimiento_unidades} ud · {r.tiempo_preparacion_min} min</p>
                </div>
                {expanded === r.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
              {expanded === r.id && (
                <div className="receta-body">
                  {r.descripcion && <p className="receta-desc">{r.descripcion}</p>}
                  <h4>Ingredientes ({r.ingredientes.length})</h4>
                  <ul className="ingredientes-list">
                    {r.ingredientes.map(ing => (
                      <li key={ing.id}>
                        {materias.find(m => m.id === ing.producto_materia_prima_id)?.nombre || `ID ${ing.producto_materia_prima_id}`}
                        {' — '}<strong>{ing.cantidad}</strong>
                        {' '}{unidades.find(u => u.id === ing.unidad_medida_id)?.abreviatura || ''}
                      </li>
                    ))}
                  </ul>
                  {r.instrucciones && <><h4>Instrucciones</h4><p className="receta-instrucciones">{r.instrucciones}</p></>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Nueva Receta" size="lg">
        <form onSubmit={handleSubmit} className="form-grid">
          <label className="form-field"><span>Nombre *</span><input required value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} /></label>
          <label className="form-field"><span>Descripción</span><input value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))} /></label>
          <div className="form-row">
            <label className="form-field"><span>Rendimiento (unidades)</span><input type="number" min="0.01" step="0.01" value={form.rendimiento_unidades} onChange={e => setForm(p => ({ ...p, rendimiento_unidades: Number(e.target.value) }))} /></label>
            <label className="form-field"><span>Tiempo prep. (min)</span><input type="number" min="0" value={form.tiempo_preparacion_min} onChange={e => setForm(p => ({ ...p, tiempo_preparacion_min: Number(e.target.value) }))} /></label>
          </div>
          <label className="form-field"><span>Instrucciones</span><textarea rows={3} value={form.instrucciones} onChange={e => setForm(p => ({ ...p, instrucciones: e.target.value }))} /></label>

          <h4 style={{ margin: '8px 0 4px' }}>Ingredientes</h4>
          {form.ingredientes.map((ing, i) => (
            <div key={i} className="ingrediente-row">
              <select required value={ing.producto_materia_prima_id} onChange={e => setForm(p => { const ings = [...p.ingredientes]; ings[i].producto_materia_prima_id = e.target.value; return { ...p, ingredientes: ings }; })}>
                <option value="">Materia prima...</option>
                {materias.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
              </select>
              <input type="number" step="0.01" placeholder="Cantidad" value={ing.cantidad} onChange={e => setForm(p => { const ings = [...p.ingredientes]; ings[i].cantidad = Number(e.target.value); return { ...p, ingredientes: ings }; })} />
              <select value={ing.unidad_medida_id} onChange={e => setForm(p => { const ings = [...p.ingredientes]; ings[i].unidad_medida_id = e.target.value; return { ...p, ingredientes: ings }; })}>
                <option value="">Unidad</option>
                {unidades.map(u => <option key={u.id} value={u.id}>{u.abreviatura}</option>)}
              </select>
              <button type="button" className="btn btn--danger-ghost btn--sm" onClick={() => removeIngrediente(i)}>✕</button>
            </div>
          ))}
          <button type="button" className="btn btn--ghost btn--sm" onClick={addIngrediente}>+ Agregar ingrediente</button>

          <div className="form-actions">
            <button type="button" className="btn btn--ghost" onClick={() => setModal(false)}>Cancelar</button>
            <button type="submit" className="btn btn--primary">Guardar Receta</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
