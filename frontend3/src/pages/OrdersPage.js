import { useEffect, useState } from 'react';
import { OrdersAPI } from '../api';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    const res = await OrdersAPI.list();
    setOrders(res.data);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleCancel = async id => {
    await OrdersAPI.cancel(id);
    fetchOrders();
  };

  if (loading) return <p>Loading orders…</p>;
  if (!orders.length) return <p>No orders placed yet.</p>;

  return (
    <div>
      <h1 className="text-2xl mb-4">My Orders</h1>
      <ul className="space-y-4">
        {orders.map(o => (
          <li key={o._id} className="p-4 bg-white shadow rounded">
            <p><span className="font-semibold">Order ID:</span> {o._id}</p>
            <p><span className="font-semibold">Status:</span> {o.status}</p>
            <p><span className="font-semibold">Total:</span> ${o.totalAmount.toFixed(2)}</p>
            {o.status !== 'Cancelled' && (
              <button
                onClick={() => handleCancel(o._id)}
                className="mt-2 px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Cancel Order
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
