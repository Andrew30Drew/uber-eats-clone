// src/pages/RestaurantsPage.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllRestaurants } from "../services/restaurantService.ts";

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
  const filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesSearch =
      restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCuisine =
      cuisineFilter === "" || restaurant.cuisine === cuisineFilter;
    return matchesSearch && matchesCuisine;
  });

  // Function to render price range as $ symbols
  const renderPriceRange = (priceRange: string) => {
    return priceRange;
  };

  // Function to render star rating
  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center">
        <span className="text-yellow-500 mr-1">★</span>
        <span>{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Restaurants</h1>

      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-2/3">
          <input
            type="text"
            placeholder="Search restaurants..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="w-full md:w-1/3">
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
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
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      ) : filteredRestaurants.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No restaurants found matching your criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map((restaurant) => (
            <Link
              to={`/restaurants/${restaurant._id}`}
              key={restaurant._id}
              className="block"
            >
              <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="relative h-48 bg-gray-200 flex items-center justify-center">
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
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400">Restaurant Image</span>
                  )}
                  {restaurant.hasFreeDelivery && (
                    <span className="absolute top-2 left-2 bg-pink-500 text-white text-xs px-2 py-1 rounded">
                      Free delivery
                    </span>
                  )}
                  {restaurant.discountPercent > 0 && (
                    <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">{`Up to ${restaurant.discountPercent}% off`}</span>
                  )}
                </div>
                <div className="p-4">
                  <h2 className="text-xl font-semibold mb-2">
                    {restaurant.name}
                  </h2>
                  <p className="text-gray-600 mb-3 line-clamp-2">
                    {restaurant.description}
                  </p>
                  <div className="flex justify-between items-center mb-2">
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
                      {restaurant.cuisine}
                    </span>
                    <div className="flex items-center space-x-4">
                      <span>{renderPriceRange(restaurant.priceRange)}</span>
                      {renderRating(restaurant.rating)}
                      <span className="text-xs text-gray-500">
                        ({restaurant.reviewCount || 0})
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span>
                      {restaurant.deliveryTimeMin || 15}-
                      {restaurant.deliveryTimeMax || 30} min
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default RestaurantsPage;
