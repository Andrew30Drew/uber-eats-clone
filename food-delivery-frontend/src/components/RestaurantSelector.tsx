import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Store, Plus } from "lucide-react";
import { getAllRestaurants } from "../services/restaurantService.ts";
import { useAuth } from "../contexts/AuthContext.tsx";

interface Restaurant {
  _id: string;
  name: string;
  image?: string;
}

interface RestaurantSelectorProps {
  currentRestaurantId?: string;
  onRestaurantChange: (restaurantId: string) => void;
  showCreateOption?: boolean;
  createPath?: string;
}

const RestaurantSelector: React.FC<RestaurantSelectorProps> = ({
  currentRestaurantId,
  onRestaurantChange,
  showCreateOption = false,
  createPath = "/dashboard",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentRestaurant, setCurrentRestaurant] = useState<Restaurant | null>(
    null
  );
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const data = await getAllRestaurants();
        // Filter to only show restaurants owned by the current user
        const ownedRestaurants = data.filter(
          (r: any) => r.ownerId === user?.id
        );
        setRestaurants(ownedRestaurants);

        // Set current restaurant based on ID or default to first one
        if (currentRestaurantId) {
          const selected = ownedRestaurants.find(
            (r) => r._id === currentRestaurantId
          );
          if (selected) {
            setCurrentRestaurant(selected);
          } else if (ownedRestaurants.length > 0) {
            setCurrentRestaurant(ownedRestaurants[0]);
          }
        } else if (ownedRestaurants.length > 0) {
          setCurrentRestaurant(ownedRestaurants[0]);
          // If no current ID is provided but restaurants exist, trigger the change handler
          onRestaurantChange(ownedRestaurants[0]._id);
        }
      } catch (err) {
        console.error("Error fetching restaurants:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, [user?.id, currentRestaurantId, onRestaurantChange]);

  const handleRestaurantSelect = (restaurant: Restaurant) => {
    setCurrentRestaurant(restaurant);
    onRestaurantChange(restaurant._id);
    setIsOpen(false);
  };

  const handleCreateNew = () => {
    navigate(createPath);
  };

  if (loading) {
    return (
      <div className="w-full bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-gray-200 h-10 w-10"></div>
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <div className="w-full bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="text-center py-2">
          <p className="text-gray-500 mb-2">
            You don't have any restaurants yet.
          </p>
          {showCreateOption && (
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Restaurant
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-800">Your Restaurants</h2>

        {showCreateOption && (
          <button
            onClick={handleCreateNew}
            className="inline-flex items-center text-sm text-primary hover:text-primary-hover font-medium"
          >
            <Plus className="h-4 w-4 mr-1" />
            New
          </button>
        )}
      </div>

      <div className="mt-3 relative">
        <button
          type="button"
          className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg text-left shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0 mr-3">
              {currentRestaurant?.image ? (
                <img
                  src={
                    currentRestaurant.image.startsWith("data:")
                      ? currentRestaurant.image
                      : currentRestaurant.image.startsWith("http")
                      ? currentRestaurant.image
                      : `http://localhost:30006${
                          currentRestaurant.image.startsWith("/")
                            ? currentRestaurant.image
                            : `/${currentRestaurant.image}`
                        }`
                  }
                  alt={currentRestaurant.name}
                  className="h-10 w-10 rounded-full object-cover"
                  onError={(e) => {
                    console.error(
                      "Error loading restaurant image:",
                      currentRestaurant.image
                    );
                    (e.target as HTMLImageElement).src =
                      "https://via.placeholder.com/40?text=R";
                  }}
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Store className="h-6 w-6 text-primary" />
                </div>
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {currentRestaurant?.name}
              </p>
              <p className="text-xs text-gray-500">
                {restaurants.length} restaurant
                {restaurants.length !== 1 ? "s" : ""} total
              </p>
            </div>
          </div>
          <ChevronDown
            className={`h-5 w-5 text-gray-400 transition-transform ${
              isOpen ? "transform rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-lg overflow-auto py-1 border border-gray-100">
            {restaurants.map((restaurant) => (
              <button
                key={restaurant._id}
                type="button"
                className={`w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center ${
                  currentRestaurant?._id === restaurant._id
                    ? "bg-primary/5"
                    : ""
                }`}
                onClick={() => handleRestaurantSelect(restaurant)}
              >
                <div className="flex-shrink-0 mr-3">
                  {restaurant.image ? (
                    <img
                      src={
                        restaurant.image.startsWith("data:")
                          ? restaurant.image
                          : restaurant.image.startsWith("http")
                          ? restaurant.image
                          : `http://localhost:30006${
                              restaurant.image.startsWith("/")
                                ? restaurant.image
                                : `/${restaurant.image}`
                            }`
                      }
                      alt={restaurant.name}
                      className="h-8 w-8 rounded-full object-cover"
                      onError={(e) => {
                        console.error(
                          "Error loading restaurant image:",
                          restaurant.image
                        );
                        (e.target as HTMLImageElement).src =
                          "https://via.placeholder.com/32?text=R";
                      }}
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Store className="h-5 w-5 text-primary" />
                    </div>
                  )}
                </div>
                <span
                  className={`block truncate ${
                    currentRestaurant?._id === restaurant._id
                      ? "font-medium text-primary"
                      : "font-normal"
                  }`}
                >
                  {restaurant.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantSelector;
