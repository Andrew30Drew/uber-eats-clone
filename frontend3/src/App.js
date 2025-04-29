import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="p-6 flex-grow">
        <Routes>
          <Route path="/" element={<Navigate to="/cart" replace />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrdersPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
