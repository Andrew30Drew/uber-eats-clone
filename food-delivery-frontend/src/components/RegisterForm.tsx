// src/components/RegisterForm.tsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Loader, User, Store, Bike } from "lucide-react";
import { useAuth } from "../contexts/AuthContext.tsx";

const RegisterForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { register, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setFormError("Passwords don't match");
      return;
    }

    await register(email, password, role);
    if (!error) {
      navigate("/restaurants");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-white to-blue-100 px-4 py-12">
      <div className="w-full max-w-md relative">
        {/* Decorative elements */}
        <div className="absolute -top-6 -left-6 w-12 h-12 bg-primary/10 rounded-full blur-xl"></div>
        <div className="absolute -bottom-8 -right-8 w-20 h-20 bg-blue-500/10 rounded-full blur-xl"></div>

        {/* Main card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-8 relative z-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
              <User className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Join Us Today
            </h1>
            <p className="text-gray-600">Create an account to get started</p>
          </div>

          {(error || formError) && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6 animate-pulse">
              <p className="flex items-center">
                <span className="mr-2">⚠️</span>
                {error || formError}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors pr-10"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Must be at least 6 characters
              </p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="pt-2">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Account Type
              </label>
              <div className="grid grid-cols-3 gap-3">
                <label
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border ${
                    role === "customer"
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-gray-200 hover:border-primary/50 hover:bg-primary/5"
                  } cursor-pointer transition-all`}
                >
                  <input
                    type="radio"
                    value="customer"
                    checked={role === "customer"}
                    onChange={() => setRole("customer")}
                    className="sr-only"
                  />
                  <User
                    className={`h-6 w-6 mb-2 ${
                      role === "customer" ? "text-primary" : "text-gray-500"
                    }`}
                  />
                  <span
                    className={`text-sm ${
                      role === "customer"
                        ? "text-primary font-medium"
                        : "text-gray-700"
                    }`}
                  >
                    Customer
                  </span>
                </label>

                <label
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border ${
                    role === "restaurant_owner"
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-gray-200 hover:border-primary/50 hover:bg-primary/5"
                  } cursor-pointer transition-all`}
                >
                  <input
                    type="radio"
                    value="restaurant_owner"
                    checked={role === "restaurant_owner"}
                    onChange={() => setRole("restaurant_owner")}
                    className="sr-only"
                  />
                  <Store
                    className={`h-6 w-6 mb-2 ${
                      role === "restaurant_owner"
                        ? "text-primary"
                        : "text-gray-500"
                    }`}
                  />
                  <span
                    className={`text-sm ${
                      role === "restaurant_owner"
                        ? "text-primary font-medium"
                        : "text-gray-700"
                    }`}
                  >
                    Restaurant
                  </span>
                </label>

                <label
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border ${
                    role === "delivery_person"
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-gray-200 hover:border-primary/50 hover:bg-primary/5"
                  } cursor-pointer transition-all`}
                >
                  <input
                    type="radio"
                    value="delivery_person"
                    checked={role === "delivery_person"}
                    onChange={() => setRole("delivery_person")}
                    className="sr-only"
                  />
                  <Bike
                    className={`h-6 w-6 mb-2 ${
                      role === "delivery_person"
                        ? "text-primary"
                        : "text-gray-500"
                    }`}
                  />
                  <span
                    className={`text-sm ${
                      role === "delivery_person"
                        ? "text-primary font-medium"
                        : "text-gray-700"
                    }`}
                  >
                    Delivery
                  </span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full px-6 py-3 mt-4 text-white font-medium bg-gradient-to-r from-primary to-pink-600 rounded-lg shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:pointer-events-none flex justify-center items-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader className="animate-spin h-5 w-5 mr-2" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary font-medium hover:underline transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
