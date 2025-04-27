import React, { useContext } from 'react';
import { CartContext } from '../contexts/CartContext';

export default function CartButton({ onClick }) {
  const { cart } = useContext(CartContext);
  const count = cart.items.reduce((sum,i)=>sum + i.quantity,0);

  return (
    <button
      onClick={onClick}
      className="fixed bottom-4 right-4 bg-primary hover:bg-primary-hover text-white p-4 rounded-full shadow-lg"
    >
      🛒{count}
    </button>
  );
}
