import React, { createContext, useState, useEffect } from 'react';
export const CartContext = createContext();

const API = 'http://localhost:3001/api/cart';

export function CartProvider({ children, userId }) {
  const [cart, setCart] = useState({ items: [], restaurantId: '' });

  async function loadCart() {
    const res = await fetch(`${API}/${userId}`);
    setCart(await res.json());
  }

  async function addToCart(restaurantId, itemId, qty=1) {
    const res = await fetch(`${API}/${userId}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ restaurantId, itemId, quantity: qty })
    });
    setCart(await res.json());
  }

  async function updateItem(itemId, quantity) {
    const res = await fetch(`${API}/${userId}/items/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity })
    });
    setCart(await res.json());
  }

  async function removeItem(itemId) {
    const res = await fetch(`${API}/${userId}/items/${itemId}`, {
      method: 'DELETE'
    });
    setCart(await res.json());
  }

  async function checkout(totalAmount) {
    const res = await fetch(`${API}/${userId}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ totalAmount })
    });
    const order = await res.json();
    setCart({ items: [], restaurantId: '' });
    return order;
  }

  useEffect(() => { loadCart(); }, [userId]);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, updateItem, removeItem, checkout }}
    >
      {children}
    </CartContext.Provider>
  );
}
