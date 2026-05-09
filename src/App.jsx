// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import Layout    from './components/layout/Layout';
import Dashboard    from './pages/Dashboard';
import Invoice      from './pages/Invoice';
import Purchase     from './pages/Purchase';
import VendorKhata  from './pages/VendorKhata';
import Customers    from './pages/Customers';
import Products     from './pages/Products';
import Companies    from './pages/Companies';
import Salesmen     from './pages/Salesmen';
import Stock        from './pages/Stock';
import Login        from './pages/Login';

// Simple auth guard
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('ma-traders-token');
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Toaster position="top-right"
          toastOptions={{
            duration: 3000,
            style: { background:'#1e293b', color:'#f8fafc', border:'1px solid #334155', fontFamily:'DM Sans, sans-serif' },
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard"  element={<Dashboard />} />
            <Route path="invoice"    element={<Invoice />} />
            <Route path="purchase"   element={<Purchase />} />
            <Route path="vendor"     element={<VendorKhata />} />
            <Route path="customers"  element={<Customers />} />
            <Route path="products"   element={<Products />} />
            <Route path="companies"  element={<Companies />} />
            <Route path="salesmen"   element={<Salesmen />} />
            <Route path="stock"      element={<Stock />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}
export default App;
