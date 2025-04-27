import React, { useState } from 'react';
const API = 'http://localhost:3001';

export default function OrderList() {
  const [userId, setUserId] = useState('');
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API}/api/orders/user/${userId}`);
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      alert('Fetch error: ' + err.message);
    }
  };

  return (
    <div className="card p-3 mb-4">
      <h4>List Orders by User</h4>
      <div className="d-flex mb-2">
        <input
          className="form-control me-2"
          placeholder="Enter user ID"
          value={userId}
          onChange={e => setUserId(e.target.value)}
        />
        <button className="btn btn-primary" onClick={fetchOrders}>
          Fetch
        </button>
      </div>
      <ul className="list-group">
        {orders.map(o => (
          <li key={o._id} className="list-group-item">
            <strong>{o._id}</strong> — Status: {o.status} — Total: {o.totalAmount}
          </li>
        ))}
      </ul>
    </div>
  );
}
