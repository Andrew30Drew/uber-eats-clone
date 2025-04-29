import { useEffect, useState } from 'react';
import { CartAPI, OrdersAPI } from '../api';
import { useNavigate } from 'react-router-dom';

const USER_ID = 'user1';

export default function CheckoutPage() {
  const [cart, setCart] = useState({ items: [], restaurantId: '' });
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const navigate = useNavigate();

  const fetchCart = async () => {
    setLoading(true);
    const res = await CartAPI.getCart(USER_ID);
    setCart(res.data);
    setLoading(false);
  };

  useEffect(() => { fetchCart(); }, []);

  const total = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const placeOrder = async () => {
    setPlacing(true);
    try {
      const orderData = {
        userId: USER_ID,
        restaurantId: cart.restaurantId,
        items: cart.items,
        totalAmount: total,
      };
      await OrdersAPI.create(orderData);
      await CartAPI.clearCart(USER_ID);
      navigate('/orders');
    } catch (err) {
      console.error(err);
    }
    setPlacing(false);
  };

  if (loading) return <p>Loading…</p>;
  if (!cart.items.length)
    return <p>Your cart is empty. Add items before checkout.</p>;

  return (
    <div>
      <h1 className="text-2xl mb-4">Checkout</h1>
      <ul className="divide-y">
        {cart.items.map(i => (
          <li key={i.itemId} className="py-2 flex justify-between">
            <span>{i.name} (x{i.quantity})</span>
            <span>${(i.price * i.quantity).toFixed(2)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-lg font-semibold">Total: ${total.toFixed(2)}</p>
      <button
        onClick={placeOrder}
        disabled={placing}
        className="mt-4 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
      >
        {placing ? 'Placing…' : 'Place Order'}
      </button>
    </div>
  );
}
