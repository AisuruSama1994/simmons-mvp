import { useEffect, useState } from 'react';
import { Plus, RefreshCw, Barcode, Pencil, Trash2 } from 'lucide-react';
import Modal from '../components/common/Modal';
import {
  getMateriasPrimas, createMateriaPrima, updateMateriaPrima, deleteMateriaPrima,
  getLotes, createLote, deleteLote,
  getCategorias, createCategoria, deleteCategoria,
  getUnidades, createUnidad,
  getProveedores, createProveedor, updateProveedor, deleteProveedor,
} from '../services/materiasPrimas';
import type {
  ProductoMateriaPrima, LoteMateriaPrima,
  Categoria, UnidadMedida,
  Proveedor, ProveedorCreate,
} from '../types';

// ─── Estados vacíos ───────────────────────────────────────────

const EMPTY_MP = {
  nombre: '', marca: '', presentacion: '', codigo_barras: '',
  descripcion: '', categoria_id: '', unidad_medida_id: '', stock_minimo: '',
};

const EMPTY_LOTE = {
  numero_lote: '', producto_materia_prima_id: '', proveedor_id: '',
  cantidad_inicial: '', precio_compra: '', fecha_compra: '',
  fecha_vencimiento: '', codigo_barras_lote: '',
};

const EMPTY_PROVEEDOR: ProveedorCreate = {
  nombre: '', domicilio: '', telefono: '', celular: '', whatsapp: '',
  email: '', instagram: '', facebook: '', website: '', notas: '',
};

// ─── Componente ───────────────────────────────────────────────

export default function Inventario() {
  const [materias, setMaterias] = useState<ProductoMateriaPrima[]>([]);
  const [lotes, setLotes] = useState<LoteMateriaPrima[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [unidades, setUnidades] = useState<UnidadMedida[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);

  const [tab, setTab] = useState<'materias' | 'lotes' | 'proveedores' | 'categorias' | 'unidades'>('materias');
  const [loading, setLoading] = useState(true);

  // Modales crear/editar
  const [modalMP, setModalMP] = useState(false);
  const [modalLote, setModalLote] = useState(false);
  const [modalProveedor, setModalProveedor] = useState(false);
  const [modalCategoria, setModalCategoria] = useState(false);
  const [modalUnidad, setModalUnidad] = useState(false);

  // Modales confirmación borrado
  const [confirmDelete, setConfirmDelete] = useState<{ tipo: string; id: number; nombre: string } | null>(null);

  // Registros en edición
  const [editandoMP, setEditandoMP] = useState<ProductoMateriaPrima | null>(null);
  const [editandoProveedor, setEditandoProveedor] = useState<Proveedor | null>(null);

  // Formularios
  const [formMP, setFormMP] = useState(EMPTY_MP);
  const [formLote, setFormLote] = useState(EMPTY_LOTE);
  const [formProveedor, setFormProveedor] = useState<ProveedorCreate>(EMPTY_PROVEEDOR);
  const [formCategoria, setFormCategoria] = useState({ nombre: '', descripcion: '' });
  const [formUnidad, setFormUnidad] = useState({ nombre: '', abreviatura: '', tipo: 'peso' });

  // ─── Carga ──────────────────────────────────────────────────

  const load = () => {
    setLoading(true);
    Promise.all([getMateriasPrimas(), getLotes(), getCategorias(), getUnidades(), getProveedores()])
      .then(([mps, ls, cats, unds, provs]) => {
        setMaterias(mps); setLotes(ls); setCategorias(cats);
        setUnidades(unds); setProveedores(provs);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  // ─── Abrir edición ──────────────────────────────────────────

  const abrirEditarMP = (m: ProductoMateriaPrima) => {
    setEditandoMP(m);
    setFormMP({
      nombre: m.nombre,
      marca: m.marca || '',
      presentacion: m.presentacion || '',
      codigo_barras: m.codigo_barras || '',
      descripcion: m.descripcion || '',
      categoria_id: m.categoria_id ? String(m.categoria_id) : '',
      unidad_medida_id: m.unidad_medida_id ? String(m.unidad_medida_id) : '',
      stock_minimo: String(m.stock_minimo),
    });
    setModalMP(true);
  };

  const abrirEditarProveedor = (p: Proveedor) => {
    setEditandoProveedor(p);
    setFormProveedor({
      nombre: p.nombre,
      domicilio: p.domicilio || '',
      telefono: p.telefono || '',
      celular: p.celular || '',
      whatsapp: p.whatsapp || '',
      email: p.email || '',
      instagram: p.instagram || '',
      facebook: p.facebook || '',
      website: p.website || '',
      notas: p.notas || '',
    });
    setModalProveedor(true);
  };

  const cerrarModalMP = () => {
    setModalMP(false);
    setEditandoMP(null);
    setFormMP(EMPTY_MP);
  };

  const cerrarModalProveedor = () => {
    setModalProveedor(false);
    setEditandoProveedor(null);
    setFormProveedor(EMPTY_PROVEEDOR);
  };

  // ─── Handlers guardar ───────────────────────────────────────

  const handleGuardarMP = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      nombre: formMP.nombre,
      marca: formMP.marca || undefined,
      presentacion: formMP.presentacion || undefined,
      codigo_barras: formMP.codigo_barras || undefined,
      descripcion: formMP.descripcion || undefined,
      stock_minimo: Number(formMP.stock_minimo) || 0,
      categoria_id: formMP.categoria_id ? Number(formMP.categoria_id) : undefined,
      unidad_medida_id: formMP.unidad_medida_id ? Number(formMP.unidad_medida_id) : undefined,
    };
    if (editandoMP) {
      await updateMateriaPrima(editandoMP.id, data);
    } else {
      await createMateriaPrima(data);
    }
    cerrarModalMP();
    load();
  };

  const handleCreateLote = async (e: React.FormEvent) => {
    e.preventDefault();
    await createLote({
      numero_lote: formLote.numero_lote,
      producto_materia_prima_id: Number(formLote.producto_materia_prima_id),
      proveedor_id: formLote.proveedor_id ? Number(formLote.proveedor_id) : undefined,
      cantidad_inicial: Number(formLote.cantidad_inicial),
      cantidad_disponible: Number(formLote.cantidad_inicial),
      precio_compra: Number(formLote.precio_compra) || 0,
      fecha_compra: formLote.fecha_compra || undefined,
      fecha_vencimiento: formLote.fecha_vencimiento || undefined,
      codigo_barras_lote: formLote.codigo_barras_lote || undefined,
    });
    setModalLote(false);
    setFormLote(EMPTY_LOTE);
    load();
  };

  const handleGuardarProveedor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editandoProveedor) {
      await updateProveedor(editandoProveedor.id, formProveedor);
    } else {
      await createProveedor(formProveedor);
    }
    cerrarModalProveedor();
    load();
  };

  const handleCreateCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    await createCategoria(formCategoria);
    setModalCategoria(false);
    setFormCategoria({ nombre: '', descripcion: '' });
    load();
  };

  const handleCreateUnidad = async (e: React.FormEvent) => {
    e.preventDefault();
    await createUnidad(formUnidad);
    setModalUnidad(false);
    setFormUnidad({ nombre: '', abreviatura: '', tipo: 'peso' });
    load();
  };

  // ─── Borrado ────────────────────────────────────────────────

  const pedirConfirmacion = (tipo: string, id: number, nombre: string) => {
    setConfirmDelete({ tipo, id, nombre });
  };

  const handleConfirmarBorrado = async () => {
    if (!confirmDelete) return;
    const { tipo, id } = confirmDelete;
    if (tipo === 'materia') await deleteMateriaPrima(id);
    else if (tipo === 'proveedor') await deleteProveedor(id);
    else if (tipo === 'lote') await deleteLote(id);
    else if (tipo === 'categoria') await deleteCategoria(id);
    setConfirmDelete(null);
    load();
  };

  // ─── Render ───────────────────────────────────────────────────

  return (
    <div className="page">

      {/* Barra superior */}
      <div className="page-actions">
        <div className="tabs">
          {(['materias', 'lotes', 'proveedores', 'categorias', 'unidades'] as const).map(t => (
            <button key={t} className={`tab ${tab === t ? 'tab--active' : ''}`} onClick={() => setTab(t)}>
              {{ materias: 'Materias Primas', lotes: 'Lotes', proveedores: 'Proveedores', categorias: 'Categorías', unidades: 'Unidades' }[t]}
            </button>
          ))}
        </div>
        <div className="btn-group">
          <button className="btn btn--ghost" onClick={load}><RefreshCw size={16} /></button>
          {tab === 'materias' && <button className="btn btn--primary" onClick={() => setModalMP(true)}><Plus size={16} /> Nueva</button>}
          {tab === 'lotes' && <button className="btn btn--primary" onClick={() => setModalLote(true)}><Plus size={16} /> Registrar Lote</button>}
          {tab === 'proveedores' && <button className="btn btn--primary" onClick={() => setModalProveedor(true)}><Plus size={16} /> Nuevo</button>}
          {tab === 'categorias' && <button className="btn btn--primary" onClick={() => setModalCategoria(true)}><Plus size={16} /> Nueva</button>}
          {tab === 'unidades' && <button className="btn btn--primary" onClick={() => setModalUnidad(true)}><Plus size={16} /> Nueva</button>}
        </div>
      </div>

      {loading ? <div className="loading-screen"><div className="spinner" /></div> : (
        <>
          {/* ── Materias Primas ── */}
          {tab === 'materias' && (
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>Nombre</th><th>Marca</th><th>Presentación</th><th>Categoría</th><th>Unidad</th><th>Stock mín.</th><th></th></tr></thead>
                <tbody>
                  {materias.length === 0 && <tr><td colSpan={7} className="td-empty">Sin materias primas</td></tr>}
                  {materias.map(m => (
                    <tr key={m.id}>
                      <td>
                        <strong>{m.nombre}</strong>
                        {m.codigo_barras && <><br /><small className="text-muted"><Barcode size={11} /> {m.codigo_barras}</small></>}
                        {m.descripcion && <><br /><small className="text-muted">{m.descripcion}</small></>}
                      </td>
                      <td>{m.marca || '—'}</td>
                      <td>{m.presentacion || '—'}</td>
                      <td>{m.categoria?.nombre || '—'}</td>
                      <td>{m.unidad_medida?.abreviatura || '—'}</td>
                      <td>{m.stock_minimo}</td>
                      <td className="td-actions">
                        <button className="btn-icon" title="Editar" onClick={() => abrirEditarMP(m)}><Pencil size={14} /></button>
                        <button className="btn-icon btn-icon--danger" title="Eliminar" onClick={() => pedirConfirmacion('materia', m.id, m.nombre)}><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Lotes ── */}
          {tab === 'lotes' && (
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>Nro. Lote</th><th>Materia Prima</th><th>Proveedor</th><th>Disponible</th><th>Precio</th><th>Vencimiento</th><th>Estado</th><th></th></tr></thead>
                <tbody>
                  {lotes.length === 0 && <tr><td colSpan={8} className="td-empty">Sin lotes registrados</td></tr>}
                  {lotes.map(l => (
                    <tr key={l.id}>
                      <td><code>{l.numero_lote}</code></td>
                      <td>{l.producto_materia_prima?.nombre || `ID ${l.producto_materia_prima_id}`}</td>
                      <td>{l.proveedor?.nombre || '—'}</td>
                      <td>{l.cantidad_disponible} / {l.cantidad_inicial}</td>
                      <td>${l.precio_compra.toFixed(2)}</td>
                      <td>{l.fecha_vencimiento ? new Date(l.fecha_vencimiento).toLocaleDateString('es-AR') : '—'}</td>
                      <td><span className={`badge badge--${l.estado}`}>{l.estado}</span></td>
                      <td className="td-actions">
                        <button className="btn-icon btn-icon--danger" title="Eliminar" onClick={() => pedirConfirmacion('lote', l.id, l.numero_lote)}><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Proveedores ── */}
          {tab === 'proveedores' && (
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>Nombre</th><th>Teléfono / WhatsApp</th><th>Email</th><th>Instagram</th><th>Domicilio</th><th>Estado</th><th></th></tr></thead>
                <tbody>
                  {proveedores.length === 0 && <tr><td colSpan={7} className="td-empty">Sin proveedores</td></tr>}
                  {proveedores.map(p => (
                    <tr key={p.id}>
                      <td><strong>{p.nombre}</strong></td>
                      <td>
                        {p.telefono && <div>{p.telefono}</div>}
                        {p.whatsapp && <div><small className="text-muted">WA: {p.whatsapp}</small></div>}
                        {!p.telefono && !p.whatsapp && '—'}
                      </td>
                      <td>{p.email || '—'}</td>
                      <td>{p.instagram ? `@${p.instagram.replace('@', '')}` : '—'}</td>
                      <td>{p.domicilio || '—'}</td>
                      <td><span className={`badge badge--${p.activo ? 'disponible' : 'agotado'}`}>{p.activo ? 'Activo' : 'Inactivo'}</span></td>
                      <td className="td-actions">
                        <button className="btn-icon" title="Editar" onClick={() => abrirEditarProveedor(p)}><Pencil size={14} /></button>
                        <button className="btn-icon btn-icon--danger" title="Eliminar" onClick={() => pedirConfirmacion('proveedor', p.id, p.nombre)}><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Categorías ── */}
          {tab === 'categorias' && (
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>Nombre</th><th>Descripción</th><th></th></tr></thead>
                <tbody>
                  {categorias.length === 0 && <tr><td colSpan={3} className="td-empty">Sin categorías</td></tr>}
                  {categorias.map(c => (
                    <tr key={c.id}>
                      <td><strong>{c.nombre}</strong></td>
                      <td>{c.descripcion || '—'}</td>
                      <td className="td-actions">
                        <button className="btn-icon btn-icon--danger" title="Eliminar" onClick={() => pedirConfirmacion('categoria', c.id, c.nombre)}><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Unidades ── */}
          {tab === 'unidades' && (
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>Nombre</th><th>Abreviatura</th><th>Tipo</th></tr></thead>
                <tbody>
                  {unidades.length === 0 && <tr><td colSpan={3} className="td-empty">Sin unidades</td></tr>}
                  {unidades.map(u => (
                    <tr key={u.id}>
                      <td>{u.nombre}</td>
                      <td><code>{u.abreviatura}</code></td>
                      <td>{u.tipo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ─── Modal: Materia Prima (crear / editar) ───────────── */}
      <Modal open={modalMP} onClose={cerrarModalMP} title={editandoMP ? 'Editar Materia Prima' : 'Nueva Materia Prima'}>
        <form onSubmit={handleGuardarMP} className="form-grid">
          <label className="form-field">
            <span>Nombre *</span>
            <input required placeholder="ej: Harina, Manteca..." value={formMP.nombre} onChange={e => setFormMP(p => ({ ...p, nombre: e.target.value }))} />
          </label>
          <label className="form-field">
            <span>Marca</span>
            <input placeholder="ej: La Serenísima, Tregar..." value={formMP.marca} onChange={e => setFormMP(p => ({ ...p, marca: e.target.value }))} />
          </label>
          <label className="form-field">
            <span>Presentación</span>
            <input placeholder="ej: 500g, 1kg, 10L..." value={formMP.presentacion} onChange={e => setFormMP(p => ({ ...p, presentacion: e.target.value }))} />
          </label>
          <label className="form-field">
            <span>Código de barras</span>
            <input placeholder="Escanear o escribir..." value={formMP.codigo_barras} onChange={e => setFormMP(p => ({ ...p, codigo_barras: e.target.value }))} />
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
            <span>Stock mínimo</span>
            <input type="number" step="0.01" placeholder="0" value={formMP.stock_minimo} onChange={e => setFormMP(p => ({ ...p, stock_minimo: e.target.value }))} />
          </label>
          <div className="form-actions">
            <button type="button" className="btn btn--ghost" onClick={cerrarModalMP}>Cancelar</button>
            <button type="submit" className="btn btn--primary">{editandoMP ? 'Guardar cambios' : 'Guardar'}</button>
          </div>
        </form>
      </Modal>

      {/* ─── Modal: Lote ─────────────────────────────────────── */}
      <Modal open={modalLote} onClose={() => { setModalLote(false); setFormLote(EMPTY_LOTE); }} title="Registrar Lote">
        <form onSubmit={handleCreateLote} className="form-grid">
          <label className="form-field">
            <span>Número de lote *</span>
            <input required value={formLote.numero_lote} onChange={e => setFormLote(p => ({ ...p, numero_lote: e.target.value }))} />
          </label>
          <label className="form-field">
            <span>Materia Prima *</span>
            <select required value={formLote.producto_materia_prima_id} onChange={e => setFormLote(p => ({ ...p, producto_materia_prima_id: e.target.value }))}>
              <option value="">Seleccionar...</option>
              {materias.map(m => <option key={m.id} value={m.id}>{m.nombre}{m.marca ? ` – ${m.marca}` : ''}{m.presentacion ? ` (${m.presentacion})` : ''}</option>)}
            </select>
          </label>
          <label className="form-field">
            <span>Proveedor</span>
            <select value={formLote.proveedor_id} onChange={e => setFormLote(p => ({ ...p, proveedor_id: e.target.value }))}>
              <option value="">Sin proveedor</option>
              {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </label>
          <label className="form-field">
            <span>Cantidad *</span>
            <input type="number" step="0.01" required placeholder="0" value={formLote.cantidad_inicial} onChange={e => setFormLote(p => ({ ...p, cantidad_inicial: e.target.value }))} />
          </label>
          <label className="form-field">
            <span>Precio de compra total</span>
            <input type="number" step="0.01" placeholder="0" value={formLote.precio_compra} onChange={e => setFormLote(p => ({ ...p, precio_compra: e.target.value }))} />
          </label>
          <label className="form-field">
            <span>Fecha de compra</span>
            <input type="date" value={formLote.fecha_compra} onChange={e => setFormLote(p => ({ ...p, fecha_compra: e.target.value }))} />
          </label>
          <label className="form-field">
            <span>Fecha de vencimiento</span>
            <input type="date" value={formLote.fecha_vencimiento} onChange={e => setFormLote(p => ({ ...p, fecha_vencimiento: e.target.value }))} />
          </label>
          <label className="form-field">
            <span>Código de barras del lote</span>
            <input placeholder="Escanear o escribir..." value={formLote.codigo_barras_lote} onChange={e => setFormLote(p => ({ ...p, codigo_barras_lote: e.target.value }))} />
          </label>
          <div className="form-actions">
            <button type="button" className="btn btn--ghost" onClick={() => { setModalLote(false); setFormLote(EMPTY_LOTE); }}>Cancelar</button>
            <button type="submit" className="btn btn--primary">Guardar</button>
          </div>
        </form>
      </Modal>

      {/* ─── Modal: Proveedor (crear / editar) ───────────────── */}
      <Modal open={modalProveedor} onClose={cerrarModalProveedor} title={editandoProveedor ? 'Editar Proveedor' : 'Nuevo Proveedor'}>
        <form onSubmit={handleGuardarProveedor} className="form-grid">
          <label className="form-field">
            <span>Nombre *</span>
            <input required placeholder="ej: La Casera, Fuerza Natural..." value={formProveedor.nombre} onChange={e => setFormProveedor(p => ({ ...p, nombre: e.target.value }))} />
          </label>
          <label className="form-field">
            <span>Domicilio</span>
            <input value={formProveedor.domicilio} onChange={e => setFormProveedor(p => ({ ...p, domicilio: e.target.value }))} />
          </label>
          <label className="form-field">
            <span>Teléfono</span>
            <input value={formProveedor.telefono} onChange={e => setFormProveedor(p => ({ ...p, telefono: e.target.value }))} />
          </label>
          <label className="form-field">
            <span>Celular</span>
            <input value={formProveedor.celular} onChange={e => setFormProveedor(p => ({ ...p, celular: e.target.value }))} />
          </label>
          <label className="form-field">
            <span>WhatsApp</span>
            <input placeholder="ej: 3624123456" value={formProveedor.whatsapp} onChange={e => setFormProveedor(p => ({ ...p, whatsapp: e.target.value }))} />
          </label>
          <label className="form-field">
            <span>Email</span>
            <input type="email" value={formProveedor.email} onChange={e => setFormProveedor(p => ({ ...p, email: e.target.value }))} />
          </label>
          <label className="form-field">
            <span>Instagram</span>
            <input placeholder="@lacasera" value={formProveedor.instagram} onChange={e => setFormProveedor(p => ({ ...p, instagram: e.target.value }))} />
          </label>
          <label className="form-field">
            <span>Facebook</span>
            <input value={formProveedor.facebook} onChange={e => setFormProveedor(p => ({ ...p, facebook: e.target.value }))} />
          </label>
          <label className="form-field">
            <span>Sitio web</span>
            <input placeholder="https://..." value={formProveedor.website} onChange={e => setFormProveedor(p => ({ ...p, website: e.target.value }))} />
          </label>
          <label className="form-field">
            <span>Notas</span>
            <input placeholder="Horarios, observaciones..." value={formProveedor.notas} onChange={e => setFormProveedor(p => ({ ...p, notas: e.target.value }))} />
          </label>
          <div className="form-actions">
            <button type="button" className="btn btn--ghost" onClick={cerrarModalProveedor}>Cancelar</button>
            <button type="submit" className="btn btn--primary">{editandoProveedor ? 'Guardar cambios' : 'Guardar'}</button>
          </div>
        </form>
      </Modal>

      {/* ─── Modal: Categoría ────────────────────────────────── */}
      <Modal open={modalCategoria} onClose={() => { setModalCategoria(false); setFormCategoria({ nombre: '', descripcion: '' }); }} title="Nueva Categoría">
        <form onSubmit={handleCreateCategoria} className="form-grid">
          <label className="form-field">
            <span>Nombre *</span>
            <input required placeholder="ej: Harinas, Azúcares, Grasas..." value={formCategoria.nombre} onChange={e => setFormCategoria(p => ({ ...p, nombre: e.target.value }))} />
          </label>
          <label className="form-field">
            <span>Descripción</span>
            <input value={formCategoria.descripcion} onChange={e => setFormCategoria(p => ({ ...p, descripcion: e.target.value }))} />
          </label>
          <div className="form-actions">
            <button type="button" className="btn btn--ghost" onClick={() => setModalCategoria(false)}>Cancelar</button>
            <button type="submit" className="btn btn--primary">Guardar</button>
          </div>
        </form>
      </Modal>

      {/* ─── Modal: Unidad ───────────────────────────────────── */}
      <Modal open={modalUnidad} onClose={() => { setModalUnidad(false); setFormUnidad({ nombre: '', abreviatura: '', tipo: 'peso' }); }} title="Nueva Unidad de Medida">
        <form onSubmit={handleCreateUnidad} className="form-grid">
          <label className="form-field">
            <span>Nombre *</span>
            <input required placeholder="ej: Kilogramo, Litro, Unidad..." value={formUnidad.nombre} onChange={e => setFormUnidad(p => ({ ...p, nombre: e.target.value }))} />
          </label>
          <label className="form-field">
            <span>Abreviatura *</span>
            <input required placeholder="ej: kg, l, u..." value={formUnidad.abreviatura} onChange={e => setFormUnidad(p => ({ ...p, abreviatura: e.target.value }))} />
          </label>
          <label className="form-field">
            <span>Tipo *</span>
            <select value={formUnidad.tipo} onChange={e => setFormUnidad(p => ({ ...p, tipo: e.target.value }))}>
              <option value="peso">Peso</option>
              <option value="volumen">Volumen</option>
              <option value="cantidad">Cantidad</option>
            </select>
          </label>
          <div className="form-actions">
            <button type="button" className="btn btn--ghost" onClick={() => setModalUnidad(false)}>Cancelar</button>
            <button type="submit" className="btn btn--primary">Guardar</button>
          </div>
        </form>
      </Modal>

      {/* ─── Modal: Confirmación borrado ─────────────────────── */}
      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Confirmar eliminación">
        <div style={{ padding: '8px 0 24px' }}>
          <p>¿Segura que querés eliminar <strong>{confirmDelete?.nombre}</strong>?</p>
          <p style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: 8 }}>Esta acción no se puede deshacer.</p>
        </div>
        <div className="form-actions">
          <button className="btn btn--ghost" onClick={() => setConfirmDelete(null)}>Cancelar</button>
          <button className="btn btn--danger" onClick={handleConfirmarBorrado}>Sí, eliminar</button>
        </div>
      </Modal>

    </div>
  );
}