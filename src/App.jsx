import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import CMSLayout from './layouts/CMSLayout';
import DashboardPage from './pages/DashboardPage';
import CategoryPage from './pages/CategoryPage';
import ProductPage from './pages/ProductPage';
import SalesOrderPage from './pages/SalesOrderPage';
import CreateSalesOrderPage from './pages/CreateSalesOrderPage';
import WalletPage from './pages/WalletPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Jalur Halaman Auth */}
        <Route path="/login" element={<LoginPage />} />

        {/* Jalur Halaman CMS Admin menggunakan Layouting */}
        <Route element={<ProtectedRoute />}>

          <Route path="/admin" element={<CMSLayout />}>
            {/* Sub-route / Menu di dalam CMS akan dirender di dalam <Outlet /> */}
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="category" element={<CategoryPage />} />
            <Route path="product" element={<ProductPage />} />

            <Route path="sales-order" element={<SalesOrderPage />} />
            <Route path="sales-order/create" element={<CreateSalesOrderPage />} />

            <Route path="wallet" element={<WalletPage />} />
          </Route>

          {/* Redirect otomatis jika user mengetik url asal-asalan */}
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;