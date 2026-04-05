import { NavLink, useLocation, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Package, BookOpen, Factory,
  ShoppingBag, ShoppingCart, BarChart3, ChevronRight,
} from 'lucide-react';

const navItems = [
  { to: '/',           icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/inventario', icon: Package,         label: 'Inventario' },
  { to: '/recetas',    icon: BookOpen,         label: 'Recetas' },
  { to: '/produccion', icon: Factory,          label: 'Producción' },
  { to: '/productos',  icon: ShoppingBag,      label: 'Productos' },
  { to: '/ventas',     icon: ShoppingCart,     label: 'Ventas / POS' },
  { to: '/reportes',   icon: BarChart3,        label: 'Reportes' },
];

export default function Layout() {
  const location = useLocation();
  const currentPage = navItems.find(item =>
    item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to)
  )?.label || 'Simmons';

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">🥐</div>
          <div>
            <div className="logo-title">Simmons</div>
            <div className="logo-sub">Panadería</div>
          </div>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}
            >
              <Icon size={18} />
              <span>{label}</span>
              <ChevronRight size={14} className="nav-chevron" />
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-version">MVP v1.0.0</div>
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content">
        <header className="topbar">
          <h1 className="topbar-title">{currentPage}</h1>
          <div className="topbar-right">
            <span className="topbar-badge">Sistema activo</span>
          </div>
        </header>
        <div className="page-body">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
