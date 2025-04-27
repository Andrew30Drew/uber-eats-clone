import React, { useContext } from 'react';
import { CartContext } from '../contexts/CartContext';

export default function CartSidebar({ open, onClose }) {
  const { cart, updateItem, removeItem, checkout } = useContext(CartContext);
  const total = cart.items.reduce((sum,i)=> sum + (i.price||0)*i.quantity, 0);

  if (!open) return null;
  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-lg p-4 flex flex-col">
      <button className="self-end" onClick={onClose}>✖️</button>
      <h4 className="mb-4">Your Cart</h4>
      <ul className="flex-1 overflow-auto">
        {cart.items.map(i => (
          <li key={i.itemId} className="flex justify-between mb-2">
            <span>{i.itemId} x {i.quantity}</span>
            <div>
              <button onClick={()=>updateItem(i.itemId,i.quantity+1)}>➕</button>
              <button onClick={()=>updateItem(i.itemId,i.quantity-1)}>➖</button>
              <button onClick={()=>removeItem(i.itemId)}>🗑️</button>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-4">
        <div className="mb-2">Total: ${total.toFixed(2)}</div>
        <button
          className="w-full bg-secondary hover:bg-secondary-hover text-white py-2 rounded"
          onClick={async ()=>{
            const order = await checkout(total);
            alert(`Order placed with ID ${order._id}`);
            onClose();
          }}
        >
          Checkout
        </button>
      </div>
    </div>
  );
}
