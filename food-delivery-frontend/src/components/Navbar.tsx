import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.tsx";

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-primary">
            FoodFast
          </Link>

          <nav>
            <ul className="flex space-x-6">
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
                    </>
                  ) : (
                    // Regular user navigation
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
                  )}
                  <li>
                    <button
                      onClick={logout}
                      className="text-gray-600 hover:text-primary transition-colors"
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
                          : "text-gray-600 hover:text-primary"
                      } transition-colors`}
                    >
                      Sign In
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/register"
                      className={`${
                        isActive("/register")
                          ? "text-primary font-medium"
                          : "text-gray-600 hover:text-primary"
                      } transition-colors btn btn-primary py-1 px-3 text-white rounded`}
                    >
                      Sign Up
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
