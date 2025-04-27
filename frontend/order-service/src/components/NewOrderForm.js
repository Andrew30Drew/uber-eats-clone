import React, { useState } from 'react';

const API = 'http://localhost:3001';

export default function NewOrderForm() {
  const [form, setForm]     = useState({
    userId: '', restaurantId: '', items: [{ itemId:'',quantity:1 }], totalAmount: ''
  });
  const [result, setResult] = useState(null);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleItemChange = (i, e) => {
    const { name, value } = e.target;
    setForm(f => {
      const items = [...f.items];
      items[i] = {
        ...items[i],
        [name]: name==='quantity' ? Number(value) : value
      };
      return { ...f, items };
    });
  };

  const addItem = () =>
    setForm(f => ({
      ...f,
      items: [...f.items, { itemId:'', quantity:1 }]
    }));

  const submit = async e => {
    e.preventDefault();
    setResult(null);
    try {
      const res = await fetch(`${API}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: form.userId,
          restaurantId: form.restaurantId,
          items: form.items,
          totalAmount: Number(form.totalAmount)
        })
      });

      // parse JSON or show text
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Non-JSON response: ${text}`);
      }

      if (!res.ok) throw new Error(JSON.stringify(data));
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setResult(`Error: ${err.message}`);
    }
  };

  return (
    <div className="card p-3 mb-4">
      <h4>Place New Order</h4>
      <form onSubmit={submit}>
        <div className="mb-2">
          <label>User ID</label>
          <input
            className="form-control"
            name="userId"
            value={form.userId}
            onChange={handleChange}
          />
        </div>
        <div className="mb-2">
          <label>Restaurant ID</label>
          <input
            className="form-control"
            name="restaurantId"
            value={form.restaurantId}
            onChange={handleChange}
          />
        </div>

        <h6>Items</h6>
        {form.items.map((it,i) => (
          <div className="d-flex mb-2" key={i}>
            <input
              className="form-control me-2"
              placeholder="Item ID"
              name="itemId"
              value={it.itemId}
              onChange={e => handleItemChange(i,e)}
            />
            <input
              className="form-control me-2"
              type="number" min="1"
              name="quantity"
              value={it.quantity}
              onChange={e => handleItemChange(i,e)}
            />
          </div>
        ))}
        <button
          type="button"
          className="btn btn-sm btn-secondary mb-3"
          onClick={addItem}
        >
          + Add item
        </button>

        <div className="mb-2">
          <label>Total Amount</label>
          <input
            className="form-control"
            name="totalAmount"
            type="number"
            value={form.totalAmount}
            onChange={handleChange}
          />
        </div>

        <button className="btn btn-primary">Submit Order</button>
      </form>

      {result && (
        <pre className="mt-3" style={{ background: '#f8f9fa', padding: '1rem' }}>
          {result}
        </pre>
      )}
    </div>
  );
}
