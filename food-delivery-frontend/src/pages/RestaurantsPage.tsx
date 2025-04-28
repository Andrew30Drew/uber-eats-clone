// src/pages/RestaurantsPage.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllRestaurants } from "../services/restaurantService.ts";
import {
  Search,
  Filter,
  Star,
  Clock,
  Tag,
  ChevronDown,
  MapPin,
  TrendingUp,
  ShoppingBag,
  Gift,
  Loader,
} from "lucide-react";

interface Restaurant {
  _id: string;
  name: string;
  description: string;
  cuisine: string;
  priceRange: string;
  rating: number;
  isAvailable: boolean;
  image?: string | null;
  hasFreeDelivery: boolean;
  discountPercent: number;
  reviewCount: number;
  deliveryTimeMin: number;
  deliveryTimeMax: number;
}

const RestaurantsPage: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [cuisineFilter, setCuisineFilter] = useState("");
  const [priceFilter, setPriceFilter] = useState("");
  const [sortOption, setSortOption] = useState("popularity");

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const data = await getAllRestaurants();
        setRestaurants(data);
        setError(null);
      } catch (err) {
        setError("Failed to fetch restaurants. Please try again later.");
        console.error("Error fetching restaurants:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  // Get unique cuisines for filter
  const cuisines = [...new Set(restaurants.map((r) => r.cuisine))];

  // Filter restaurants based on search term and cuisine
  let filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesSearch =
      restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCuisine =
      cuisineFilter === "" || restaurant.cuisine === cuisineFilter;
    const matchesPriceRange =
      priceFilter === "" || restaurant.priceRange === priceFilter;
    return matchesSearch && matchesCuisine && matchesPriceRange;
  });

  // Sort restaurants based on selected option
  filteredRestaurants = filteredRestaurants.sort((a, b) => {
    switch (sortOption) {
      case "rating":
        return b.rating - a.rating;
      case "deliveryTime":
        return a.deliveryTimeMin - b.deliveryTimeMin;
      case "discount":
        return b.discountPercent - a.discountPercent;
      default: // popularity (default)
        return b.reviewCount - a.reviewCount;
    }
  });

  // Function to render price range as $ symbols
  const renderPriceRange = (priceRange: string) => {
    switch (priceRange) {
      case "$":
        return <span className="text-gray-700">$</span>;
      case "$$":
        return <span className="text-gray-700">$$</span>;
      case "$$$":
        return <span className="text-gray-700">$$$</span>;
      case "$$$$":
        return <span className="text-gray-700">$$$$</span>;
      default:
        return <span className="text-gray-700">{priceRange}</span>;
    }
  };

  // Function to render star rating
  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center">
        <Star size={16} fill="#FBBF24" stroke="#FBBF24" className="mr-1" />
        <span className="font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="relative mb-12 pb-8 border-b border-gray-200">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Restaurants Near You
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Find the best restaurants, cafés, and bars in your area. Filter by
            cuisine, price range, and more.
          </p>

          {/* Decorative elements */}
          <div className="absolute -bottom-6 left-0 w-24 h-3 bg-gradient-to-r from-primary to-pink-600 rounded-full"></div>
          <div className="absolute -top-10 right-10 w-20 h-20 bg-yellow-100 rounded-full opacity-50"></div>
          <div className="absolute top-0 right-0 w-10 h-10 bg-primary/10 rounded-full"></div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-5">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for restaurants, cuisines, or dishes..."
                  className="w-full px-4 pl-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search
                  className="absolute left-4 top-3.5 text-gray-400"
                  size={18}
                />
              </div>
            </div>

            <div className="md:col-span-3">
              <div className="relative">
                <select
                  className="w-full appearance-none px-4 pl-12 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
                  value={cuisineFilter}
                  onChange={(e) => setCuisineFilter(e.target.value)}
                >
                  <option value="">All Cuisines</option>
                  {cuisines.map((cuisine) => (
                    <option key={cuisine} value={cuisine}>
                      {cuisine}
                    </option>
                  ))}
                </select>
                <Tag
                  className="absolute left-4 top-3.5 text-gray-400"
                  size={18}
                />
                <ChevronDown
                  className="absolute right-4 top-3.5 text-gray-400"
                  size={18}
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="relative">
                <select
                  className="w-full appearance-none px-4 pl-12 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value)}
                >
                  <option value="">Any Price</option>
                  <option value="$">$ (Inexpensive)</option>
                  <option value="$$">$$ (Moderate)</option>
                  <option value="$$$">$$$ (Expensive)</option>
                  <option value="$$$$">$$$$ (Very Expensive)</option>
                </select>
                <div className="absolute left-4 top-3.5 text-gray-400">$</div>
                <ChevronDown
                  className="absolute right-4 top-3.5 text-gray-400"
                  size={18}
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="relative">
                <select
                  className="w-full appearance-none px-4 pl-12 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <option value="popularity">Most Popular</option>
                  <option value="rating">Highest Rating</option>
                  <option value="deliveryTime">Fastest Delivery</option>
                  <option value="discount">Best Deals</option>
                </select>
                <Filter
                  className="absolute left-4 top-3.5 text-gray-400"
                  size={18}
                />
                <ChevronDown
                  className="absolute right-4 top-3.5 text-gray-400"
                  size={18}
                />
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader className="w-8 h-8 text-primary animate-pulse" />
              </div>
            </div>
            <p className="mt-4 text-gray-600 font-medium">
              Loading restaurants...
            </p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm leading-5 font-medium text-red-800">
                  Error
                </h3>
                <div className="mt-2 text-sm leading-5 text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
            <ShoppingBag className="mx-auto h-16 w-16 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No restaurants found
            </h3>
            <p className="mt-2 text-gray-500 max-w-md mx-auto">
              We couldn't find any restaurants matching your search criteria.
              Try adjusting your filters or search term.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setCuisineFilter("");
                setPriceFilter("");
              }}
              className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                Showing{" "}
                <span className="font-medium text-gray-900">
                  {filteredRestaurants.length}
                </span>{" "}
                restaurants
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredRestaurants.map((restaurant) => (
                <Link
                  to={`/restaurants/${restaurant._id}`}
                  key={restaurant._id}
                  className="block group"
                >
                  <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 transform group-hover:-translate-y-1 border border-gray-100 h-full flex flex-col">
                    <div className="relative h-52 bg-gray-100 overflow-hidden">
                      {restaurant.image ? (
                        <img
                          src={
                            restaurant.image.startsWith("http") ||
                            restaurant.image.startsWith("/uploads/")
                              ? `http://localhost:30006${
                                  restaurant.image.startsWith("/")
                                    ? restaurant.image
                                    : `/${restaurant.image}`
                                }`
                              : `data:image/jpeg;base64,${restaurant.image}`
                          }
                          alt={restaurant.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <span className="text-gray-400">
                            No Image Available
                          </span>
                        </div>
                      )}

                      {/* Restaurant badges */}
                      <div className="absolute top-0 left-0 p-4 flex flex-col space-y-2">
                        {restaurant.hasFreeDelivery && (
                          <span className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-medium px-2.5 py-1.5 rounded-full flex items-center shadow-sm">
                            <Gift size={12} className="mr-1" />
                            Free Delivery
                          </span>
                        )}
                        {restaurant.discountPercent > 0 && (
                          <span className="bg-gradient-to-r from-pink-500 to-pink-600 text-white text-xs font-medium px-2.5 py-1.5 rounded-full flex items-center shadow-sm">
                            <TrendingUp size={12} className="mr-1" />
                            Up to {restaurant.discountPercent}% off
                          </span>
                        )}
                      </div>

                      {/* Rating badge */}
                      <div className="absolute bottom-2 right-2">
                        <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center shadow-sm">
                          {renderRating(restaurant.rating)}
                          <span className="text-xs text-gray-500 ml-1">
                            ({restaurant.reviewCount || 0})
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col">
                      <div className="mb-1 flex items-center">
                        <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
                          {restaurant.cuisine}
                        </span>
                        <span className="ml-2 text-gray-600">
                          {renderPriceRange(restaurant.priceRange)}
                        </span>
                      </div>

                      <h2 className="text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors mt-2 mb-1">
                        {restaurant.name}
                      </h2>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">
                        {restaurant.description}
                      </p>

                      <div className="flex items-center text-sm text-gray-500 mt-auto pt-3 border-t border-gray-50">
                        <Clock size={16} className="mr-1.5 text-gray-400" />
                        <span>
                          {restaurant.deliveryTimeMin || 15}-
                          {restaurant.deliveryTimeMax || 30} min delivery
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RestaurantsPage;
