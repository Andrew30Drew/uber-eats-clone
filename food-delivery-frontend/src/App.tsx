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
      <div className="min-h-screen bg-background pt-6">
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
        </Routes>
      </div>
    </>
  );
};

export default App;
