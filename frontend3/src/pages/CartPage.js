import { useEffect, useState } from 'react';
import { CartAPI } from '../api';

const USER_ID = 'user1'; // replace with real auth in the future

export default function CartPage() {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await CartAPI.getCart(USER_ID);
      setCart(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchCart(); }, []);

  const handleRemove = async itemId => {
    await CartAPI.removeItem(USER_ID, itemId);
    fetchCart();
  };

  const handleClear = async () => {
    await CartAPI.clearCart(USER_ID);
    fetchCart();
  };

  if (loading) return <p>Loading your cart…</p>;
  if (!cart.items.length)
    return <p>Your cart is empty.</p>;

  return (
    <div>
      <h1 className="text-2xl mb-4">Your Cart</h1>
      <ul className="space-y-2">
        {cart.items.map(i => (
          <li key={i.itemId} className="p-4 bg-white shadow rounded flex justify-between">
            <div>
              <p className="font-semibold">{i.name}</p>
              <p>Qty: {i.quantity} × ${i.price.toFixed(2)}</p>
            </div>
            <button
              onClick={() => handleRemove(i.itemId)}
              className="text-red-500 hover:underline"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      <button
        onClick={handleClear}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Clear Cart
      </button>
    </div>
  );
}
