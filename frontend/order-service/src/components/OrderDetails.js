import React, { useState } from 'react';
const API = 'http://localhost:3001';

export default function OrderDetails() {
  const [id, setId] = useState('');
  const [order, setOrder] = useState(null);

  const fetchOne = async () => {
    try {
      const res = await fetch(`${API}/api/orders/${id}`);
      const data = await res.json();
      setOrder(data);
    } catch (err) {
      alert('Fetch error: ' + err.message);
    }
  };

  return (
    <div className="card p-3 mb-4">
      <h4>Get Order Details</h4>
      <div className="d-flex mb-2">
        <input
          className="form-control me-2"
          placeholder="Enter order ID"
          value={id}
          onChange={e => setId(e.target.value)}
        />
        <button className="btn btn-primary" onClick={fetchOne}>
          Fetch
        </button>
      </div>
      {order && (
        <pre style={{ background: '#f8f9fa', padding: '1rem' }}>
          {JSON.stringify(order, null, 2)}
        </pre>
      )}
    </div>
  );
}
