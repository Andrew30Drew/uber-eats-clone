import { NavLink } from 'react-router-dom';
export default function Navbar() {
  return (
    <nav className="bg-white shadow p-4 flex space-x-4">
      <NavLink to="/cart" className="hover:text-blue-600" activeClassName="font-bold">Cart</NavLink>
      <NavLink to="/checkout" className="hover:text-blue-600" activeClassName="font-bold">Checkout</NavLink>
      <NavLink to="/orders" className="hover:text-blue-600" activeClassName="font-bold">My Orders</NavLink>
    </nav>
  );
}
