import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.tsx";
import { Menu, X, ShoppingBag, User, ChevronDown } from "lucide-react";

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  return (
    <header className="bg-white/90 backdrop-blur-sm shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link
            to="/"
            className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-pink-600 flex items-center"
          >
            <ShoppingBag className="mr-2 h-7 w-7 text-primary" />
            <span>FoodFast</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <ul className="flex space-x-8">
              {isAuthenticated ? (
                <>
                  {user?.role === "restaurant_owner" ? (
                    // Restaurant owner navigation
                    <>
                      <li>
                        <Link
                          to="/dashboard"
                          className={`${
                            isActive("/dashboard")
                              ? "text-primary font-medium"
                              : "text-gray-600 hover:text-primary"
                          } transition-colors`}
                        >
                          Dashboard
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/dashboard/profile"
                          className={`${
                            isActive("/dashboard/profile")
                              ? "text-primary font-medium"
                              : "text-gray-600 hover:text-primary"
                          } transition-colors`}
                        >
                          Profile
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/dashboard/menu"
                          className={`${
                            isActive("/dashboard/menu")
                              ? "text-primary font-medium"
                              : "text-gray-600 hover:text-primary"
                          } transition-colors`}
                        >
                          Menu
                        </Link>
                      </li>
                    </>
                  ) : user?.role === "delivery_person" ? (
                    // Delivery person navigation
                    <li>
                      <Link
                        to="/delivery-dashboard"
                        className={`${
                          isActive("/delivery-dashboard")
                            ? "text-primary font-medium"
                            : "text-gray-600 hover:text-primary"
                        } transition-colors`}
                      >
                        Delivery Dashboard
                      </Link>
                    </li>
                  ) : (
                    // Regular user navigation
                    <>
                      <li>
                        <Link
                          to="/restaurants"
                          className={`${
                            isActive("/restaurants")
                              ? "text-primary font-medium"
                              : "text-gray-600 hover:text-primary"
                          } transition-colors`}
                        >
                          Restaurants
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/orders"
                          className={`${
                            isActive("/orders")
                              ? "text-primary font-medium"
                              : "text-gray-600 hover:text-primary"
                          } transition-colors`}
                        >
                          My Orders
                        </Link>
                      </li>
                    </>
                  )}

                  {/* User dropdown */}
                  <li className="relative">
                    <button
                      onClick={toggleUserMenu}
                      className="flex items-center text-gray-600 hover:text-primary transition-colors focus:outline-none"
                    >
                      <User className="h-5 w-5 mr-1" />
                      <span className="mr-1">{user?.email.split("@")[0]}</span>
                      <ChevronDown className="h-4 w-4" />
                    </button>

                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-100">
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Profile
                        </Link>
                        <button
                          onClick={() => {
                            logout();
                            setUserMenuOpen(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </li>
                </>
              ) : (
                // Not authenticated
                <>
                  <li>
                    <Link
                      to="/login"
                      className={`${
                        isActive("/login")
                          ? "text-primary font-medium"
                          : "text-gray-600 hover:text-primary"
                      } transition-colors`}
                    >
                      Sign In
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/register"
                      className="bg-gradient-to-r from-primary to-pink-600 hover:from-primary/90 hover:to-pink-600/90 text-white font-medium py-2 px-4 rounded-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-md hover:shadow-lg"
                    >
                      Sign Up
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="md:hidden text-gray-600 hover:text-primary focus:outline-none"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4">
            <ul className="flex flex-col space-y-4">
              {isAuthenticated ? (
                <>
                  <li className="font-medium text-gray-800 pb-2 border-b border-gray-200">
                    {user?.email}
                  </li>

                  {user?.role === "restaurant_owner" ? (
                    // Restaurant owner navigation
                    <>
                      <li>
                        <Link
                          to="/dashboard"
                          className={`${
                            isActive("/dashboard")
                              ? "text-primary font-medium"
                              : "text-gray-600"
                          } block`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Dashboard
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/dashboard/profile"
                          className={`${
                            isActive("/dashboard/profile")
                              ? "text-primary font-medium"
                              : "text-gray-600"
                          } block`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Profile
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/dashboard/menu"
                          className={`${
                            isActive("/dashboard/menu")
                              ? "text-primary font-medium"
                              : "text-gray-600"
                          } block`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Menu
                        </Link>
                      </li>
                    </>
                  ) : user?.role === "delivery_person" ? (
                    // Delivery person navigation
                    <li>
                      <Link
                        to="/delivery-dashboard"
                        className={`${
                          isActive("/delivery-dashboard")
                            ? "text-primary font-medium"
                            : "text-gray-600"
                        } block`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Delivery Dashboard
                      </Link>
                    </li>
                  ) : (
                    // Regular user navigation
                    <>
                      <li>
                        <Link
                          to="/restaurants"
                          className={`${
                            isActive("/restaurants")
                              ? "text-primary font-medium"
                              : "text-gray-600"
                          } block`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Restaurants
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/orders"
                          className={`${
                            isActive("/orders")
                              ? "text-primary font-medium"
                              : "text-gray-600"
                          } block`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          My Orders
                        </Link>
                      </li>
                    </>
                  )}

                  <li>
                    <Link
                      to="/profile"
                      className={`${
                        isActive("/profile")
                          ? "text-primary font-medium"
                          : "text-gray-600"
                      } block`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile
                    </Link>
                  </li>

                  <li>
                    <button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="text-gray-600 block w-full text-left"
                    >
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                // Not authenticated
                <>
                  <li>
                    <Link
                      to="/login"
                      className={`${
                        isActive("/login")
                          ? "text-primary font-medium"
                          : "text-gray-600"
                      } block`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/register"
                      className="bg-gradient-to-r from-primary to-pink-600 text-white font-medium py-2 px-4 rounded-lg inline-block"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Navbar;
