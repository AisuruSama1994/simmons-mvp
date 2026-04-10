import { useState, useEffect } from 'react';
import { Plus, RefreshCw, Trash2, Edit2, ChevronDown, ChevronUp, Upload } from 'lucide-react';
import Modal from '../components/common/Modal';
import {
  getMateriasPrimas, createMateriaPrima, updateMateriaPrima, deleteMateriaPrima,
  getLotes, createLote, updateLote, deleteLote,
  getProveedores, getCategorias, getUnidades,
} from '../services/materiasPrimas';

interface MateriaPrima {
  id: number;
  nombre: string;
  descripcion?: string;
  categoria_id?: number;
  unidad_medida_id: number;
  stock_minimo: number;
  activo: boolean;
}

interface Lote {
  id: number;
  producto_id: number;
  proveedor_id: number;
  cantidad_presentacion: number;
  unidad_presentacion_id: number;
  peso_unitario: number;
  cantidad_actual: number;
  precio_unitario: number;
  precio_total: number;
  fecha_compra: string;
  fecha_vencimiento: string;
  lote_numero: string;
  codigo_barras_lote?: string;
  activo: boolean;
}

interface Categoria {
  id: number;
  nombre: string;
}

interface Unidad {
  id: number;
  nombre: string;
  abreviacion: string;
}

interface Proveedor {
  id: number;
  nombre: string;
}

type Tab = 'productos' | 'lotes' | 'importar';

export default function Inventario() {
  const [tab, setTab] = useState<Tab>('productos');
  const [materiasPrimas, setMateriasPrimas] = useState<MateriaPrima[]>([]);
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);

  // Modales
  const [showModalMP, setShowModalMP] = useState(false);
  const [showModalLote, setShowModalLote] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [expandedLote, setExpandedLote] = useState<number | null>(null);

  // Edición
  const [editingMP, setEditingMP] = useState<MateriaPrima | null>(null);
  const [editingLote, setEditingLote] = useState<Lote | null>(null);
  const [deletingId, setDeletingId] = useState<{ id: number; tipo: 'mp' | 'lote'; nombre: string } | null>(null);

  // Formularios
  const [formMP, setFormMP] = useState({
    nombre: '',
    descripcion: '',
    categoria_id: '',
    unidad_medida_id: '',
    stock_minimo: '',
  });

  const [formLote, setFormLote] = useState({
    producto_id: '',
    proveedor_id: '',
    cantidad_presentacion: '',
    unidad_presentacion_id: '',
    peso_unitario: '',
    precio_unitario: '',
    fecha_compra: new Date().toISOString().split('T')[0],
    fecha_vencimiento: '',
    lote_numero: '',
    codigo_barras_lote: '',
  });

  const [excelFile, setExcelFile] = useState<File | null>(null);

  // Load
  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [mp, lo, cat, un, prov] = await Promise.all([
        getMateriasPrimas().catch(() => []),
        getLotes().catch(() => []),
        getCategorias().catch(() => []),
        getUnidades().catch(() => []),
        getProveedores().catch(() => []),
      ]);
      setMateriasPrimas(Array.isArray(mp) ? mp : []);
      setLotes(Array.isArray(lo) ? lo : []);
      setCategorias(Array.isArray(cat) ? cat : []);
      setUnidades(Array.isArray(un) ? un : []);
      setProveedores(Array.isArray(prov) ? prov : []);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  // ─── MATERIA PRIMA HANDLERS ─────────────────────────
  const handleSaveMP = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        nombre: formMP.nombre,
        descripcion: formMP.descripcion || undefined,
        categoria_id: formMP.categoria_id ? parseInt(formMP.categoria_id) : undefined,
        unidad_medida_id: parseInt(formMP.unidad_medida_id),
        stock_minimo: parseInt(formMP.stock_minimo) || 0,
      };

      if (editingMP) {
        await updateMateriaPrima(editingMP.id, data);
      } else {
        await createMateriaPrima(data);
      }

      closeModalMP();
      await load();
    } catch (error) {
      console.error('Error guardando materia prima:', error);
    }
  };

  const closeModalMP = () => {
    setShowModalMP(false);
    setEditingMP(null);
    setFormMP({ nombre: '', descripcion: '', categoria_id: '', unidad_medida_id: '', stock_minimo: '' });
  };

  const openEditMP = (mp: MateriaPrima) => {
    setEditingMP(mp);
    setFormMP({
      nombre: mp.nombre,
      descripcion: mp.descripcion || '',
      categoria_id: mp.categoria_id ? String(mp.categoria_id) : '',
      unidad_medida_id: String(mp.unidad_medida_id),
      stock_minimo: String(mp.stock_minimo),
    });
    setShowModalMP(true);
  };

  // ─── LOTES HANDLERS ────────────────────────────────
  const handleSaveLote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const precioTotal = parseFloat(formLote.precio_unitario) * parseInt(formLote.cantidad_presentacion);

      const data = {
        producto_id: parseInt(formLote.producto_id),
        proveedor_id: parseInt(formLote.proveedor_id),
        cantidad_presentacion: parseInt(formLote.cantidad_presentacion),
        unidad_presentacion_id: parseInt(formLote.unidad_presentacion_id),
        peso_unitario: parseFloat(formLote.peso_unitario),
        precio_unitario: parseFloat(formLote.precio_unitario),
        precio_total: precioTotal,
        fecha_compra: formLote.fecha_compra,
        fecha_vencimiento: formLote.fecha_vencimiento,
        lote_numero: formLote.lote_numero,
        codigo_barras_lote: formLote.codigo_barras_lote || undefined,
      };

      if (editingLote) {
        await updateLote(editingLote.id, data);
      } else {
        await createLote(data);
      }

      closeModalLote();
      await load();
    } catch (error) {
      console.error('Error guardando lote:', error);
    }
  };

  const closeModalLote = () => {
    setShowModalLote(false);
    setEditingLote(null);
    setFormLote({
      producto_id: '',
      proveedor_id: '',
      cantidad_presentacion: '',
      unidad_presentacion_id: '',
      peso_unitario: '',
      precio_unitario: '',
      fecha_compra: new Date().toISOString().split('T')[0],
      fecha_vencimiento: '',
      lote_numero: '',
      codigo_barras_lote: '',
    });
  };

  const openEditLote = (lote: Lote) => {
    setEditingLote(lote);
    setFormLote({
      producto_id: String(lote.producto_id),
      proveedor_id: String(lote.proveedor_id),
      cantidad_presentacion: String(lote.cantidad_presentacion),
      unidad_presentacion_id: String(lote.unidad_presentacion_id),
      peso_unitario: String(lote.peso_unitario),
      precio_unitario: String(lote.precio_unitario),
      fecha_compra: lote.fecha_compra,
      fecha_vencimiento: lote.fecha_vencimiento,
      lote_numero: lote.lote_numero,
      codigo_barras_lote: lote.codigo_barras_lote || '',
    });
    setShowModalLote(true);
  };

  // ─── DELETE ────────────────────────────────
  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      if (deletingId.tipo === 'mp') {
        await deleteMateriaPrima(deletingId.id);
      } else {
        await deleteLote(deletingId.id);
      }
      setDeletingId(null);
      await load();
    } catch (error) {
      console.error('Error eliminando:', error);
    }
  };

  // ─── EXCEL IMPORT ────────────────────────────────
  const handleExcelUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!excelFile) return;
    alert('⚠️ Importación Excel - Próximamente\n\nSe implementará con SheetJS para parsear Excel');
    setShowImportModal(false);
  };

  return (
    <div className="page">
      {/* Header */}
      <div className="page-actions">
        <div />
        <div className="btn-group">
          <button className="btn btn--ghost" onClick={load}><RefreshCw size={16} /></button>
          {tab === 'productos' && <button className="btn btn--primary" onClick={() => { setEditingMP(null); setFormMP({ nombre: '', descripcion: '', categoria_id: '', unidad_medida_id: '', stock_minimo: '' }); setShowModalMP(true); }}><Plus size={16} /> Nueva MP</button>}
          {tab === 'lotes' && <button className="btn btn--primary" onClick={() => { setEditingLote(null); closeModalLote(); setShowModalLote(true); }}><Plus size={16} /> Nuevo Lote</button>}
          {tab === 'importar' && <button className="btn btn--primary" onClick={() => setShowImportModal(true)}><Upload size={16} /> Importar</button>}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '0', marginBottom: '20px' }}>
        {(['productos', 'lotes', 'importar'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '12px 0',
              paddingBottom: '12px',
              borderBottom: tab === t ? '2px solid var(--primary)' : 'none',
              background: 'none',
              border: 'none',
              color: tab === t ? 'var(--primary)' : 'var(--text-muted)',
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'var(--transition)',
              fontSize: '14px',
            }}
          >
            {{ productos: '📦 Materias Primas', lotes: '📋 Lotes', importar: '📥 Importar' }[t]}
          </button>
        ))}
      </div>

      {loading ? <div className="loading-screen"><div className="spinner" /></div> : (
        <>
          {/* TAB: PRODUCTOS */}
          {tab === 'productos' && (
            <div>
              {materiasPrimas.length === 0 ? (
                <p className="empty-state">Sin materias primas. ¡Creá la primera!</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                  {materiasPrimas.map(mp => (
                    <div key={mp.id} style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px', transition: 'var(--transition)', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                      <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px', color: 'var(--text)' }}>{mp.nombre}</h3>
                      {mp.descripcion && <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>{mp.descripcion}</p>}
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div>Categoría: {categorias.find(c => c.id === mp.categoria_id)?.nombre || '—'}</div>
                        <div>Unidad: {unidades.find(u => u.id === mp.unidad_medida_id)?.abreviacion || '—'}</div>
                        <div>Stock mín: {mp.stock_minimo}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn--ghost btn--sm" onClick={() => openEditMP(mp)}><Edit2 size={14} /></button>
                        <button className="btn btn--danger-ghost btn--sm" onClick={() => setDeletingId({ id: mp.id, tipo: 'mp', nombre: mp.nombre })}><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: LOTES */}
          {tab === 'lotes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {lotes.length === 0 ? (
                <p className="empty-state">Sin lotes registrados.</p>
              ) : (
                lotes.map(lote => {
                  const mp = materiasPrimas.find(m => m.id === lote.producto_id);
                  const prov = proveedores.find(p => p.id === lote.proveedor_id);
                  const diasVencer = Math.ceil((new Date(lote.fecha_vencimiento).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

                  return (
                    <div key={lote.id} style={{ background: 'var(--bg-2)', border: diasVencer < 0 ? '1px solid var(--red)' : diasVencer < 7 ? '1px solid var(--orange)' : '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                      <div
                        onClick={() => setExpandedLote(expandedLote === lote.id ? null : lote.id)}
                        style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: diasVencer < 0 ? 'rgba(239,68,68,0.05)' : diasVencer < 7 ? 'rgba(249,115,22,0.05)' : 'transparent' }}
                      >
                        <div>
                          <h4 style={{ fontWeight: 600, marginBottom: '4px' }}>{lote.lote_numero}</h4>
                          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{mp?.nombre} • {prov?.nombre || 'Sin proveedor'}</p>
                        </div>
                        {expandedLote === lote.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>

                      {expandedLote === lote.id && (
                        <div style={{ padding: '16px', borderTop: '1px solid var(--border)', fontSize: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', color: 'var(--text-muted)' }}>
                          <div><div style={{ color: 'var(--text-muted)', fontSize: '11px', marginBottom: '2px' }}>Cantidad</div>{lote.cantidad_actual}</div>
                          <div><div style={{ color: 'var(--text-muted)', fontSize: '11px', marginBottom: '2px' }}>Precio unitario</div>${lote.precio_unitario.toFixed(2)}</div>
                          <div><div style={{ color: 'var(--text-muted)', fontSize: '11px', marginBottom: '2px' }}>Total</div>${lote.precio_total.toFixed(2)}</div>
                          <div><div style={{ color: 'var(--text-muted)', fontSize: '11px', marginBottom: '2px' }}>Vencimiento</div>{new Date(lote.fecha_vencimiento).toLocaleDateString('es-AR')}</div>
                          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '8px', marginTop: '8px' }}>
                            <button className="btn btn--ghost btn--sm" onClick={() => openEditLote(lote)}><Edit2 size={14} /></button>
                            <button className="btn btn--danger-ghost btn--sm" onClick={() => setDeletingId({ id: lote.id, tipo: 'lote', nombre: lote.lote_numero })}><Trash2 size={14} /></button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB: IMPORTAR */}
          {tab === 'importar' && (
            <div style={{ maxWidth: '500px', margin: '0 auto' }}>
              <form onSubmit={handleExcelUpload} className="form-grid">
                <label style={{ display: 'block', border: '2px dashed var(--border)', borderRadius: 'var(--radius)', padding: '40px', textAlign: 'center', cursor: 'pointer', transition: 'var(--transition)' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                  <input type="file" accept=".xlsx,.xls,.csv" onChange={e => setExcelFile(e.target.files?.[0] || null)} style={{ display: 'none' }} />
                  <Upload size={32} style={{ margin: '0 auto 12px', opacity: 0.6 }} />
                  <p style={{ fontWeight: 600, marginBottom: '4px' }}>{excelFile ? excelFile.name : 'Seleccionar archivo'}</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Excel (.xlsx, .xls) o CSV</p>
                </label>
                <button type="submit" disabled={!excelFile} className="btn btn--primary" style={{ width: '100%', opacity: excelFile ? 1 : 0.5, cursor: excelFile ? 'pointer' : 'not-allowed' }}>
                  Importar
                </button>
              </form>
            </div>
          )}
        </>
      )}

      {/* MODAL: Materia Prima */}
      <Modal open={showModalMP} onClose={closeModalMP} title={editingMP ? 'Editar Materia Prima' : 'Nueva Materia Prima'} size="lg">
        <form onSubmit={handleSaveMP} className="form-grid">
          <label className="form-field"><span>Nombre *</span><input required placeholder="Harina, Manteca..." value={formMP.nombre} onChange={e => setFormMP({ ...formMP, nombre: e.target.value })} /></label>
          <label className="form-field"><span>Descripción</span><input value={formMP.descripcion} onChange={e => setFormMP({ ...formMP, descripcion: e.target.value })} /></label>
          <label className="form-field"><span>Categoría</span><select value={formMP.categoria_id} onChange={e => setFormMP({ ...formMP, categoria_id: e.target.value })}><option value="">Sin categoría</option>{categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}</select></label>
          <label className="form-field"><span>Unidad de medida *</span><select required value={formMP.unidad_medida_id} onChange={e => setFormMP({ ...formMP, unidad_medida_id: e.target.value })}><option value="">Seleccionar...</option>{unidades.map(u => <option key={u.id} value={u.id}>{u.nombre} ({u.abreviacion})</option>)}</select></label>
          <label className="form-field"><span>Stock mínimo</span><input type="number" value={formMP.stock_minimo} onChange={e => setFormMP({ ...formMP, stock_minimo: e.target.value })} /></label>
          <div className="form-actions">
            <button type="button" className="btn btn--ghost" onClick={closeModalMP}>Cancelar</button>
            <button type="submit" className="btn btn--primary">{editingMP ? 'Guardar cambios' : 'Guardar'}</button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Lote */}
      <Modal open={showModalLote} onClose={closeModalLote} title={editingLote ? 'Editar Lote' : 'Nuevo Lote'} size="lg">
        <form onSubmit={handleSaveLote} className="form-grid">
          <label className="form-field"><span>Materia Prima *</span><select required value={formLote.producto_id} onChange={e => setFormLote({ ...formLote, producto_id: e.target.value })}><option value="">Seleccionar...</option>{materiasPrimas.map(mp => <option key={mp.id} value={mp.id}>{mp.nombre}</option>)}</select></label>
          <label className="form-field"><span>Proveedor *</span><select required value={formLote.proveedor_id} onChange={e => setFormLote({ ...formLote, proveedor_id: e.target.value })}><option value="">Seleccionar...</option>{proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}</select></label>
          <div className="form-row">
            <label className="form-field"><span>Cantidad *</span><input type="number" required value={formLote.cantidad_presentacion} onChange={e => setFormLote({ ...formLote, cantidad_presentacion: e.target.value })} /></label>
            <label className="form-field"><span>Unidad *</span><select required value={formLote.unidad_presentacion_id} onChange={e => setFormLote({ ...formLote, unidad_presentacion_id: e.target.value })}><option value="">Sel...</option>{unidades.map(u => <option key={u.id} value={u.id}>{u.abreviacion}</option>)}</select></label>
          </div>
          <label className="form-field"><span>Peso/Volumen unitario *</span><input type="number" required step="0.01" value={formLote.peso_unitario} onChange={e => setFormLote({ ...formLote, peso_unitario: e.target.value })} /></label>
          <div className="form-row">
            <label className="form-field"><span>Precio unitario *</span><input type="number" required step="0.01" value={formLote.precio_unitario} onChange={e => setFormLote({ ...formLote, precio_unitario: e.target.value })} /></label>
            <label className="form-field"><span>Total</span><input type="number" disabled value={(parseFloat(formLote.precio_unitario || '0') * parseInt(formLote.cantidad_presentacion || '0')) || ''} style={{ opacity: 0.5 }} /></label>
          </div>
          <div className="form-row">
            <label className="form-field"><span>Fecha compra *</span><input type="date" required value={formLote.fecha_compra} onChange={e => setFormLote({ ...formLote, fecha_compra: e.target.value })} /></label>
            <label className="form-field"><span>Vencimiento *</span><input type="date" required value={formLote.fecha_vencimiento} onChange={e => setFormLote({ ...formLote, fecha_vencimiento: e.target.value })} /></label>
          </div>
          <label className="form-field"><span>Lote número</span><input value={formLote.lote_numero} onChange={e => setFormLote({ ...formLote, lote_numero: e.target.value })} /></label>
          <label className="form-field"><span>Código de barras</span><input value={formLote.codigo_barras_lote} onChange={e => setFormLote({ ...formLote, codigo_barras_lote: e.target.value })} /></label>
          <div className="form-actions">
            <button type="button" className="btn btn--ghost" onClick={closeModalLote}>Cancelar</button>
            <button type="submit" className="btn btn--primary">{editingLote ? 'Guardar cambios' : 'Guardar'}</button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Importar */}
      <Modal open={showImportModal} onClose={() => setShowImportModal(false)} title="Importar desde Excel">
        <form onSubmit={handleExcelUpload} className="form-grid">
          <label style={{ display: 'block', border: '2px dashed var(--border)', borderRadius: 'var(--radius)', padding: '32px', textAlign: 'center', cursor: 'pointer' }}>
            <input type="file" accept=".xlsx,.xls,.csv" onChange={e => setExcelFile(e.target.files?.[0] || null)} style={{ display: 'none' }} />
            <Upload size={32} style={{ margin: '0 auto 12px', opacity: 0.6 }} />
            <p style={{ fontWeight: 600 }}>{excelFile ? excelFile.name : 'Seleccionar archivo'}</p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Excel o CSV</p>
          </label>
          <div className="form-actions">
            <button type="button" className="btn btn--ghost" onClick={() => setShowImportModal(false)}>Cancelar</button>
            <button type="submit" disabled={!excelFile} className="btn btn--primary">Importar</button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Confirmar Delete */}
      <Modal open={!!deletingId} onClose={() => setDeletingId(null)} title="Confirmar eliminación">
        <div style={{ marginBottom: '20px' }}>
          <p>¿Seguro que querés eliminar <strong>{deletingId?.nombre}</strong>?</p>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>Esta acción no se puede deshacer.</p>
        </div>
        <div className="form-actions">
          <button className="btn btn--ghost" onClick={() => setDeletingId(null)}>Cancelar</button>
          <button className="btn btn--danger" onClick={handleDelete}>Eliminar</button>
        </div>
      </Modal>
    </div>
  );
}
