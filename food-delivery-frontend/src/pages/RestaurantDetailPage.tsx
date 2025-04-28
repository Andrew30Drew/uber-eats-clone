// src/pages/RestaurantDetailPage.tsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getRestaurantById } from "../services/restaurantService.ts";
import MenuItemModal from "../components/MenuItemModal.tsx";

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isAvailable: boolean;
  image?: string | null;
}

interface Restaurant {
  _id: string;
  name: string;
  description: string;
  cuisine: string;
  priceRange: string;
  rating: number;
  menu: MenuItem[];
  image?: string | null;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  openingHours: {
    day: string;
    open: string;
    close: string;
  }[];
  hasFreeDelivery: boolean;
  discountPercent: number;
  deliveryTimeMin: number;
  deliveryTimeMax: number;
  reviewCount: number;
}

const RestaurantDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedMenuItem, setSelectedMenuItem] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await getRestaurantById(id);
        setRestaurant(data);
        setError(null);
      } catch (err) {
        setError("Failed to fetch restaurant details. Please try again later.");
        console.error("Error fetching restaurant:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [id]);

  // Get unique categories from menu
  const categories = restaurant?.menu
    ? ["all", ...new Set(restaurant.menu.map((item) => item.category))]
    : ["all"];

  // Filter menu items by category
  const filteredMenu = restaurant?.menu
    ? activeCategory === "all"
      ? restaurant.menu
      : restaurant.menu.filter((item) => item.category === activeCategory)
    : [];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error || "Restaurant not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="h-64 bg-gray-200 rounded-lg mb-6 flex items-center justify-center">
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
              className="w-full h-64 object-cover rounded-lg"
            />
          ) : (
            <span className="text-gray-400">Restaurant Image</span>
          )}
        </div>

        <h1 className="text-3xl font-bold mb-2">{restaurant.name}</h1>
        <p className="text-gray-600 mb-4">{restaurant.description}</p>

        <div className="flex flex-wrap gap-4 mb-4">
          <div className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
            {restaurant.cuisine}
          </div>
          <div className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
            {restaurant.priceRange}
          </div>
          <div className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm flex items-center">
            <span className="text-yellow-500 mr-1">★</span>
            <span>{restaurant.rating.toFixed(1)}</span>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Address</h2>
          <p className="text-gray-600">
            {restaurant.address.street}, {restaurant.address.city},{" "}
            {restaurant.address.state} {restaurant.address.zipCode}
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Opening Hours</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {restaurant.openingHours.map((hours) => (
              <div key={hours.day} className="text-gray-600">
                <span className="capitalize">{hours.day}:</span> {hours.open} -{" "}
                {hours.close}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t pt-8">
        <h2 className="text-2xl font-bold mb-6">Menu</h2>

        <div className="mb-6 overflow-x-auto">
          <div className="flex space-x-2 min-w-max">
            {categories.map((category) => (
              <button
                key={category}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  activeCategory === category
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
                onClick={() => setActiveCategory(category)}
              >
                {category === "all" ? "All Items" : category}
              </button>
            ))}
          </div>
        </div>

        {filteredMenu.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              No menu items available in this category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredMenu.map((item) => (
              <div
                key={item._id}
                className="border rounded-lg p-4 flex cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => {
                  setSelectedMenuItem(item);
                  setIsModalOpen(true);
                }}
              >
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold mb-1">{item.name}</h3>
                  <p className="text-gray-600 mb-2 line-clamp-2">
                    {item.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">
                      ${item.price.toFixed(2)}
                    </span>
                    {!item.isAvailable && (
                      <span className="text-red-500 text-sm">
                        Currently unavailable
                      </span>
                    )}
                  </div>
                </div>
                {item.image ? (
                  <div className="w-20 h-20 ml-4 rounded flex-shrink-0 overflow-hidden">
                    <img
                      src={
                        item.image.startsWith("http") ||
                        item.image.startsWith("/uploads/")
                          ? `http://localhost:30006${
                              item.image.startsWith("/")
                                ? item.image
                                : `/${item.image}`
                            }`
                          : `data:image/jpeg;base64,${item.image}`
                      }
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>

      <MenuItemModal
        menuItem={selectedMenuItem}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddToCart={(item) => {
          // TODO: Integrate with cart logic
          console.log("Add to cart:", item);
        }}
        restaurant={
          restaurant
            ? {
                name: restaurant.name,
                logo: restaurant.image,
                rating: restaurant.rating,
                reviewCount: restaurant.reviewCount,
                cuisine: restaurant.cuisine,
                badges: [
                  ...(restaurant.hasFreeDelivery ? ["Free delivery"] : []),
                  ...(restaurant.discountPercent > 0
                    ? [`Up to ${restaurant.discountPercent}% off`]
                    : []),
                ],
                deliveryTimeMin: restaurant.deliveryTimeMin,
                deliveryTimeMax: restaurant.deliveryTimeMax,
                serviceCharge: undefined,
              }
            : undefined
        }
      />
    </div>
  );
};

export default RestaurantDetailPage;
