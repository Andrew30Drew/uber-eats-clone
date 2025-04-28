// src/pages/RestaurantDetailPage.tsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getRestaurantById } from "../services/restaurantService.ts";
import MenuItemModal from "../components/MenuItemModal.tsx";
import {
  Star,
  Clock,
  MapPin,
  Calendar,
  DollarSign,
  Tag,
  ThumbsUp,
  Users,
  Utensils,
  ShoppingBag,
  Loader,
  ChevronRight,
  AlertTriangle,
  Heart,
} from "lucide-react";

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
  const [isFavorite, setIsFavorite] = useState(false);

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

  // Function to format price range
  const renderPriceRange = (priceRange: string) => {
    switch (priceRange) {
      case "$":
        return <span>Inexpensive</span>;
      case "$$":
        return <span>Moderate</span>;
      case "$$$":
        return <span>Expensive</span>;
      case "$$$$":
        return <span>Very Expensive</span>;
      default:
        return <span>{priceRange}</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-white flex flex-col justify-center items-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader className="w-8 h-8 text-primary animate-pulse" />
          </div>
        </div>
        <p className="mt-4 text-gray-600 font-medium">
          Loading restaurant details...
        </p>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
            </div>
            <div>
              <h3 className="text-red-800 font-medium">Error</h3>
              <p className="text-red-700">{error || "Restaurant not found"}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero section with restaurant image */}
      <div className="relative h-80 md:h-96 lg:h-[450px] w-full bg-gray-900 overflow-hidden">
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
            className="w-full h-full object-cover opacity-90"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary/20 to-gray-800 flex items-center justify-center">
            <Utensils className="h-20 w-20 text-white/40" />
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>

        {/* Restaurant info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center mb-1 space-x-2">
              <Tag size={16} className="text-primary" />
              <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                {restaurant.cuisine}
              </span>

              {restaurant.hasFreeDelivery && (
                <span className="text-sm font-medium text-green-400 bg-green-400/10 px-3 py-1 rounded-full flex items-center">
                  <ThumbsUp size={14} className="mr-1" /> Free Delivery
                </span>
              )}

              {restaurant.discountPercent > 0 && (
                <span className="text-sm font-medium text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-full flex items-center">
                  <DollarSign size={14} className="mr-1" />{" "}
                  {restaurant.discountPercent}% Off
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">
              {restaurant.name}
            </h1>

            <div className="flex flex-wrap items-center gap-3 md:gap-5 text-sm md:text-base text-gray-100">
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 mr-1 inline" />
                <span className="font-medium">
                  {restaurant.rating.toFixed(1)}
                </span>
                <span className="text-gray-300 ml-1">
                  ({restaurant.reviewCount}+ reviews)
                </span>
              </div>

              <div className="flex items-center">
                <DollarSign className="h-4 w-4 text-gray-300 mr-1 inline" />
                <span>{renderPriceRange(restaurant.priceRange)}</span>
              </div>

              <div className="flex items-center">
                <Clock className="h-4 w-4 text-gray-300 mr-1 inline" />
                <span>
                  {restaurant.deliveryTimeMin || 15}-
                  {restaurant.deliveryTimeMax || 30} min
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Favorite button */}
        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm p-2.5 rounded-full hover:bg-white/20 transition-colors"
        >
          <Heart
            className={`h-5 w-5 ${
              isFavorite ? "fill-red-500 text-red-500" : "text-white"
            }`}
          />
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Description */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <Utensils className="mr-2 h-5 w-5 text-primary" />
                About {restaurant.name}
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {restaurant.description}
              </p>
            </div>

            {/* Menu section */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="border-b border-gray-100 p-6">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <ShoppingBag className="mr-2 h-6 w-6 text-primary" />
                  Menu
                </h2>

                {/* Categories tabs */}
                <div className="mb-6 overflow-x-auto pb-1">
                  <div className="flex space-x-2 min-w-max">
                    {categories.map((category) => (
                      <button
                        key={category}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          activeCategory === category
                            ? "bg-primary text-white shadow-md shadow-primary/20"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        }`}
                        onClick={() => setActiveCategory(category)}
                      >
                        {category === "all" ? "All Items" : category}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 pt-3">
                {filteredMenu.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="mx-auto h-12 w-12 text-gray-300" />
                    <p className="text-gray-500 mt-2">
                      No menu items available in this category.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {filteredMenu.map((item) => (
                      <div
                        key={item._id}
                        className="bg-white rounded-lg overflow-hidden border border-gray-100 hover:border-primary/30 hover:shadow-md transition-all duration-200 cursor-pointer group"
                        onClick={() => {
                          setSelectedMenuItem(item);
                          setIsModalOpen(true);
                        }}
                      >
                        <div className="p-4 flex">
                          <div className="flex-grow relative pr-4">
                            <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">
                              {item.name}
                            </h3>
                            <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                              {item.description}
                            </p>
                            <div className="flex justify-between items-center mt-2">
                              <span className="font-medium text-primary">
                                ${item.price.toFixed(2)}
                              </span>
                              {!item.isAvailable && (
                                <span className="text-red-500 text-xs font-medium bg-red-50 px-2 py-1 rounded">
                                  Currently unavailable
                                </span>
                              )}
                            </div>

                            {item.isAvailable && (
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-primary opacity-0 group-hover:opacity-100 transform transition-all group-hover:translate-x-1">
                                <ChevronRight />
                              </span>
                            )}
                          </div>

                          {item.image ? (
                            <div className="w-24 h-24 rounded-lg flex-shrink-0 overflow-hidden border border-gray-100 group-hover:border-primary/20 transition-all">
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
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                              />
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right sidebar with contact info */}
          <div className="lg:col-span-1">
            {/* Address card */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <MapPin className="mr-2 h-5 w-5 text-primary" />
                Address
              </h3>
              <p className="text-gray-700 mb-2">{restaurant.address.street},</p>
              <p className="text-gray-700">
                {restaurant.address.city}, {restaurant.address.state}{" "}
                {restaurant.address.zipCode}
              </p>

              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(
                  `${restaurant.address.street}, ${restaurant.address.city}, ${restaurant.address.state} ${restaurant.address.zipCode}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 block w-full text-center px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                View on map
              </a>
            </div>

            {/* Opening hours card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-primary" />
                Opening Hours
              </h3>
              <div className="space-y-2">
                {restaurant.openingHours.map((hours) => (
                  <div
                    key={hours.day}
                    className="flex justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <span className="text-gray-700 capitalize font-medium">
                      {hours.day}
                    </span>
                    <span className="text-gray-600">
                      {hours.open} - {hours.close}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
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
