import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.tsx";

interface SidebarProps {
  restaurantId?: string;
}

const DashboardSidebar: React.FC<SidebarProps> = ({ restaurantId }) => {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const menuItemClass = (path: string) => {
    return `flex items-center px-4 py-3 rounded-md transition-colors ${
      isActive(path)
        ? "bg-primary text-white"
        : "hover:bg-gray-100 text-gray-700"
    }`;
  };

  return (
    <div className="w-64 bg-white rounded-lg shadow-sm p-4">
      <div className="mb-6 pb-4 border-b">
        <h2 className="text-lg font-semibold text-gray-800">
          Restaurant Dashboard
        </h2>
        <p className="text-sm text-gray-500">
          Welcome, {user?.email?.split("@")[0]}
        </p>
      </div>

      <nav className="space-y-2">
        <Link to="/dashboard" className={menuItemClass("/dashboard")}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
            />
          </svg>
          Dashboard
        </Link>

        <Link
          to="/dashboard/profile"
          className={menuItemClass("/dashboard/profile")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          Restaurant Profile
        </Link>

        {restaurantId && (
          <Link
            to={`/dashboard/menu?restaurantId=${restaurantId}`}
            className={menuItemClass("/dashboard/menu")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            Manage Menu
          </Link>
        )}

        <div className="border-t my-4"></div>

        <Link
          to="/"
          className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          Back to Home
        </Link>
      </nav>
    </div>
  );
};

export default DashboardSidebar;
