import { useEffect, useState } from 'react';
import { Trash2, ShoppingCart, Plus, Minus } from 'lucide-react';
import { getProductos } from '../services/productos';
import { createVenta, getVentas } from '../services/ventas';
import type { Producto, Venta } from '../types';

interface CartItem { producto: Producto; cantidad: number }

export default function Ventas() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [metodo, setMetodo] = useState('efectivo');
  const [descuento, setDescuento] = useState(0);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [tab, setTab] = useState<'pos' | 'historial'>('pos');

  const load = async () => {
    setLoading(true);
    const [prods, ventas] = await Promise.all([getProductos(), getVentas()]);
    setProductos(prods);
    setVentas(ventas);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const addToCart = (prod: Producto) => {
    setCart(c => {
      const existe = c.find(i => i.producto.id === prod.id);
      if (existe) return c.map(i => i.producto.id === prod.id ? { ...i, cantidad: i.cantidad + 1 } : i);
      return [...c, { producto: prod, cantidad: 1 }];
    });
  };

  const updateQty = (id: number, delta: number) => {
    setCart(c => c.map(i => i.producto.id === id ? { ...i, cantidad: Math.max(1, i.cantidad + delta) } : i));
  };

  const removeFromCart = (id: number) => setCart(c => c.filter(i => i.producto.id !== id));

  const subtotal = cart.reduce((acc, i) => acc + i.producto.precio_venta * i.cantidad, 0);
  const total = Math.max(0, subtotal - descuento);

  const handleVenta = async () => {
    if (cart.length === 0) return;
    setProcesando(true);
    try {
      await createVenta({
        items: cart.map(i => ({ producto_id: i.producto.id, cantidad: i.cantidad, precio_unitario: i.producto.precio_venta })),
        descuento,
        metodo_pago: metodo,
      });
      setCart([]);
      setDescuento(0);
      alert('✅ Venta registrada correctamente');
      load();
    } catch (err: any) {
      alert('❌ ' + (err.response?.data?.detail || 'Error al procesar la venta'));
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="page">
      <div className="page-actions">
        <div className="tabs">
          <button className={`tab ${tab === 'pos' ? 'tab--active' : ''}`} onClick={() => setTab('pos')}>Punto de Venta</button>
          <button className={`tab ${tab === 'historial' ? 'tab--active' : ''}`} onClick={() => setTab('historial')}>Historial</button>
        </div>
      </div>

      {loading ? <div className="loading-screen"><div className="spinner" /></div> : tab === 'pos' ? (
        <div className="pos-layout">
          {/* Catálogo */}
          <div className="pos-catalog">
            <h3 className="section-title">Productos</h3>
            <div className="pos-grid">
              {productos.map(p => (
                <button key={p.id} className="pos-item" onClick={() => addToCart(p)}>
                  <div className="pos-item-icon">🍞</div>
                  <div className="pos-item-name">{p.nombre}</div>
                  <div className="pos-item-price">${p.precio_venta.toFixed(2)}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Carrito */}
          <div className="pos-cart">
            <div className="cart-header">
              <ShoppingCart size={18} />
              <h3>Carrito</h3>
              {cart.length > 0 && <span className="cart-count">{cart.reduce((a, i) => a + i.cantidad, 0)}</span>}
            </div>

            <div className="cart-items">
              {cart.length === 0 && <p className="empty-text">Tocá un producto para agregarlo</p>}
              {cart.map(item => (
                <div key={item.producto.id} className="cart-item">
                  <div className="cart-item-name">{item.producto.nombre}</div>
                  <div className="cart-item-controls">
                    <button className="qty-btn" onClick={() => updateQty(item.producto.id, -1)}><Minus size={12} /></button>
                    <span className="qty-val">{item.cantidad}</span>
                    <button className="qty-btn" onClick={() => updateQty(item.producto.id, +1)}><Plus size={12} /></button>
                  </div>
                  <div className="cart-item-price">${(item.producto.precio_venta * item.cantidad).toFixed(2)}</div>
                  <button className="cart-item-remove" onClick={() => removeFromCart(item.producto.id)}><Trash2 size={14} /></button>
                </div>
              ))}
            </div>

            <div className="cart-footer">
              <div className="cart-row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="cart-row">
                <span>Descuento</span>
                <input className="discount-input" type="number" min="0" step="0.01" value={descuento} onChange={e => setDescuento(Number(e.target.value))} />
              </div>
              <div className="cart-total"><span>Total</span><span>${total.toFixed(2)}</span></div>
              <select className="cart-metodo" value={metodo} onChange={e => setMetodo(e.target.value)}>
                <option value="efectivo">💵 Efectivo</option>
                <option value="tarjeta">💳 Tarjeta</option>
                <option value="transferencia">🏦 Transferencia</option>
              </select>
              <button
                className="btn btn--primary btn--full"
                disabled={cart.length === 0 || procesando}
                onClick={handleVenta}
              >
                {procesando ? 'Procesando...' : `Confirmar venta · $${total.toFixed(2)}`}
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Historial
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Nro. Venta</th><th>Total</th><th>Método</th><th>Estado</th><th>Items</th><th>Fecha</th></tr></thead>
            <tbody>
              {ventas.length === 0 && <tr><td colSpan={6} className="td-empty">Sin ventas registradas</td></tr>}
              {ventas.map(v => (
                <tr key={v.id}>
                  <td><code>{v.numero_venta}</code></td>
                  <td><strong>${v.total.toFixed(2)}</strong></td>
                  <td>{v.metodo_pago}</td>
                  <td><span className={`badge ${v.estado === 'completada' ? 'badge--green' : 'badge--red'}`}>{v.estado}</span></td>
                  <td>{v.items.length}</td>
                  <td>{new Date(v.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
