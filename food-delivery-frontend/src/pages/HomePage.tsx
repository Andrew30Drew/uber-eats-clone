// src/pages/HomePage.tsx
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.tsx";
import { Truck, Utensils, Star, ShoppingBag, Clock, Award } from "lucide-react";

const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-white to-blue-100 py-20">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="md:w-1/2 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Delicious Food,{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-pink-600">
                  Delivered Fast
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-lg">
                Discover the best food from over 1,000 restaurants and get it
                delivered to your doorstep in minutes.
              </p>
              <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4">
                {isAuthenticated ? (
                  user?.role === "restaurant_owner" ? (
                    <Link
                      to="/dashboard"
                      className="bg-gradient-to-r from-primary to-pink-600 hover:from-primary/90 hover:to-pink-600/90 text-white font-medium py-3 px-8 rounded-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg hover:shadow-xl"
                    >
                      Manage Your Restaurant
                    </Link>
                  ) : user?.role === "delivery_person" ? (
                    <Link
                      to="/delivery-dashboard"
                      className="bg-gradient-to-r from-primary to-pink-600 hover:from-primary/90 hover:to-pink-600/90 text-white font-medium py-3 px-8 rounded-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg hover:shadow-xl"
                    >
                      Delivery Dashboard
                    </Link>
                  ) : (
                    <Link
                      to="/restaurants"
                      className="bg-gradient-to-r from-primary to-pink-600 hover:from-primary/90 hover:to-pink-600/90 text-white font-medium py-3 px-8 rounded-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg hover:shadow-xl"
                    >
                      Browse Restaurants
                    </Link>
                  )
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="bg-gradient-to-r from-primary to-pink-600 hover:from-primary/90 hover:to-pink-600/90 text-white font-medium py-3 px-8 rounded-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg hover:shadow-xl"
                    >
                      Get Started
                    </Link>
                    <Link
                      to="/login"
                      className="border-2 border-gray-300 hover:border-primary text-gray-700 hover:text-primary font-medium py-3 px-8 rounded-lg transition-colors"
                    >
                      Sign In
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative w-full max-w-md">
                <div className="absolute -top-4 -left-4 w-full h-full bg-primary/20 rounded-3xl transform rotate-3"></div>
                <div className="absolute -bottom-4 -right-4 w-full h-full bg-blue-500/20 rounded-3xl transform -rotate-3"></div>
                <img
                  src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80"
                  alt="Delicious food"
                  className="w-full rounded-2xl object-cover h-80 md:h-96 relative z-10 shadow-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose FoodFast?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We're dedicated to providing the best food delivery experience
              with these key benefits
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-md text-center transition-transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-r from-primary/10 to-pink-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Fast Delivery</h3>
              <p className="text-gray-600">
                Hot food delivered to your doorstep in minutes, with real-time
                order tracking.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md text-center transition-transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-r from-primary/10 to-pink-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Quality Food</h3>
              <p className="text-gray-600">
                Only the best restaurants with high-quality ingredients from
                trusted partners.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md text-center transition-transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-r from-primary/10 to-pink-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Best Prices</h3>
              <p className="text-gray-600">
                Affordable prices with no hidden fees, plus exclusive deals and
                discounts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Getting your favorite food delivered is easier than ever
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="relative inline-flex">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <Utensils className="h-10 w-10 text-primary" />
                </div>
                <span className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                  1
                </span>
              </div>
              <h3 className="text-xl font-bold mb-3">Choose a Restaurant</h3>
              <p className="text-gray-600">
                Browse through our wide selection of restaurants and cuisines
              </p>
            </div>

            <div className="text-center">
              <div className="relative inline-flex">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <ShoppingBag className="h-10 w-10 text-primary" />
                </div>
                <span className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                  2
                </span>
              </div>
              <h3 className="text-xl font-bold mb-3">Select Your Meals</h3>
              <p className="text-gray-600">
                Choose from a variety of dishes and customize as needed
              </p>
            </div>

            <div className="text-center">
              <div className="relative inline-flex">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <Truck className="h-10 w-10 text-primary" />
                </div>
                <span className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                  3
                </span>
              </div>
              <h3 className="text-xl font-bold mb-3">Fast Delivery</h3>
              <p className="text-gray-600">
                Track your order in real-time as it's prepared and delivered
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-pink-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Order Delicious Food?
          </h2>
          <p className="text-white/80 max-w-2xl mx-auto mb-8">
            Join thousands of satisfied customers who use FoodFast for their
            food delivery needs
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {!isAuthenticated && (
              <>
                <Link
                  to="/register"
                  className="bg-white text-primary hover:bg-gray-100 font-medium py-3 px-8 rounded-lg transition-colors shadow-md"
                >
                  Sign Up Now
                </Link>
                <Link
                  to="/login"
                  className="bg-transparent border-2 border-white hover:bg-white/10 text-white font-medium py-3 px-8 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
              </>
            )}
            {isAuthenticated && (
              <Link
                to="/restaurants"
                className="bg-white text-primary hover:bg-gray-100 font-medium py-3 px-8 rounded-lg transition-colors shadow-md"
              >
                Order Now
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
