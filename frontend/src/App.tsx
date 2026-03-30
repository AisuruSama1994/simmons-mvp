import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard  from './pages/Dashboard';
import Inventario from './pages/Inventario';
import Recetas    from './pages/Recetas';
import Produccion from './pages/Produccion';
import Productos  from './pages/Productos';
import Ventas     from './pages/Ventas';
import Reportes   from './pages/Reportes';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/"           element={<Dashboard />} />
          <Route path="/inventario" element={<Inventario />} />
          <Route path="/recetas"    element={<Recetas />} />
          <Route path="/produccion" element={<Produccion />} />
          <Route path="/productos"  element={<Productos />} />
          <Route path="/ventas"     element={<Ventas />} />
          <Route path="/reportes"   element={<Reportes />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
