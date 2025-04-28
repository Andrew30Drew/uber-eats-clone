// src/App.tsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext.tsx";
import Navbar from "./components/Navbar.tsx";
import LoginForm from "./components/LoginForm.tsx";
import RegisterForm from "./components/RegisterForm.tsx";
import HomePage from "./pages/HomePage.tsx";
import RestaurantsPage from "./pages/RestaurantsPage.tsx";
import RestaurantDetailPage from "./pages/RestaurantDetailPage.tsx";
import RestaurantDashboardPage from "./pages/RestaurantDashboardPage.tsx";
import RestaurantProfilePage from "./pages/RestaurantProfilePage.tsx";
import RestaurantMenuPage from "./pages/RestaurantMenuPage.tsx";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

// Moved inside to ensure it's used within AuthProvider
const AppContent: React.FC = () => {
  // Protected route component
  const ProtectedRoute: React.FC<{
    children: React.ReactNode;
    requiredRole?: string;
  }> = ({ children, requiredRole }) => {
    const { isAuthenticated, user, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          Loading...
        </div>
      );
    }

    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }

    if (requiredRole && user?.role !== requiredRole) {
      return <Navigate to="/" />;
    }

    return <>{children}</>;
  };

  return (
    <>
      <Navbar />
      <div className="w-full">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />

          {/* Regular user routes */}
          <Route
            path="/restaurants"
            element={
              <ProtectedRoute>
                <RestaurantsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/restaurants/:id"
            element={
              <ProtectedRoute>
                <RestaurantDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <div className="container mx-auto p-6">
                  <h1 className="text-2xl font-bold mb-4">My Orders</h1>
                  <p>Your order history will appear here.</p>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <div className="container mx-auto p-6">
                  <h1 className="text-2xl font-bold mb-4">My Profile</h1>
                  <p>Your profile information will appear here.</p>
                </div>
              </ProtectedRoute>
            }
          />

          {/* Restaurant owner routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredRole="restaurant_owner">
                <RestaurantDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/profile"
            element={
              <ProtectedRoute requiredRole="restaurant_owner">
                <RestaurantProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/menu"
            element={
              <ProtectedRoute requiredRole="restaurant_owner">
                <RestaurantMenuPage />
              </ProtectedRoute>
            }
          />

          {/* Delivery person routes */}
          <Route
            path="/delivery-dashboard"
            element={
              <ProtectedRoute requiredRole="delivery_person">
                <div className="container mx-auto p-6">
                  <h1 className="text-2xl font-bold mb-4">
                    Delivery Dashboard
                  </h1>
                  <p>Delivery assignments and tracking will appear here.</p>
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </>
  );
};

export default App;
