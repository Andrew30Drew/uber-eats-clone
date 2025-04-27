import React, { useState } from 'react';
import { CartProvider } from './contexts/CartContext';
import CartButton     from './components/CartButton';
import CartSidebar    from './components/CartSidebar';
import NewOrderForm   from './components/NewOrderForm';
import OrderList      from './components/OrderList';
import OrderDetails   from './components/OrderDetails';

function App() {
  const userId = 'user123'; // replace with actual auth
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <CartProvider userId={userId}>
      <div className="container py-4">
        <h2 className="mb-4">Order Service UI</h2>
        <NewOrderForm />
        <OrderList />
        <OrderDetails />
      </div>

      <CartButton onClick={()=>setCartOpen(true)} />
      <CartSidebar open={cartOpen} onClose={()=>setCartOpen(false)} />
    </CartProvider>
  );
}

export default App;
