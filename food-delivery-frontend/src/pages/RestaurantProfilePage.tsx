// src/pages/RestaurantProfilePage.tsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext.tsx";
import { useSearchParams } from "react-router-dom";
import DashboardSidebar from "../components/DashboardSidebar.tsx";
import {
  getAllRestaurants,
  getRestaurantById,
  updateRestaurant,
} from "../services/restaurantService.ts";
import { uploadImage } from "../services/imageService.ts";

const API_URL = "http://localhost:3006"; // Restaurant service URL

interface Restaurant {
  _id: string;
  name: string;
  description: string;
  cuisine: string;
  priceRange: string;
  isAvailable: boolean;
  image: string | null;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    location?: {
      type: string;
      coordinates: [number, number];
    };
  };
  deliveryZone: string;
  openingHours: string;
  deliveryTimeMin?: number;
  deliveryTimeMax?: number;
  hasFreeDelivery?: boolean;
  discountPercent?: number;
}

interface FormData {
  name: string;
  description: string;
  cuisine: string;
  priceRange: string;
  isAvailable: boolean;
  image: string | null;
  imageFile?: File | null;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  deliveryTimeMin?: number;
  deliveryTimeMax?: number;
  hasFreeDelivery?: boolean;
  discountPercent?: number;
}

const RestaurantProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const restaurantId = searchParams.get("restaurantId");

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    cuisine: "",
    priceRange: "",
    isAvailable: true,
    image: null,
    imageFile: null,
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
    deliveryTimeMin: undefined,
    deliveryTimeMax: undefined,
    hasFreeDelivery: undefined,
    discountPercent: undefined,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        setLoading(true);

        // If restaurantId is provided in URL, use it directly
        if (restaurantId) {
          const restaurantData = await getRestaurantById(restaurantId);
          setRestaurant(restaurantData);
          setFormData({
            name: restaurantData.name,
            description: restaurantData.description,
            cuisine: restaurantData.cuisine,
            priceRange: restaurantData.priceRange,
            isAvailable: restaurantData.isAvailable,
            image: restaurantData.image || null,
            imageFile: null,
            address: {
              street: restaurantData.address?.street || "",
              city: restaurantData.address?.city || "",
              state: restaurantData.address?.state || "",
              zipCode: restaurantData.address?.zipCode || "",
              country: restaurantData.address?.country || "",
            },
            deliveryTimeMin: restaurantData.deliveryTimeMin,
            deliveryTimeMax: restaurantData.deliveryTimeMax,
            hasFreeDelivery: restaurantData.hasFreeDelivery,
            discountPercent: restaurantData.discountPercent,
          });

          if (restaurantData.image) {
            setImagePreview(
              restaurantData.image.startsWith("http")
                ? restaurantData.image
                : `http://localhost:3006${restaurantData.image}`
            );
          }
        } else {
          // Fallback to finding restaurant owned by current user if no ID provided
          const data = await getAllRestaurants();
          const ownedRestaurant = data.find((r: any) => r.ownerId === user?.id);

          if (ownedRestaurant) {
            setRestaurant(ownedRestaurant);
            setFormData({
              name: ownedRestaurant.name,
              description: ownedRestaurant.description,
              cuisine: ownedRestaurant.cuisine,
              priceRange: ownedRestaurant.priceRange,
              isAvailable: ownedRestaurant.isAvailable,
              image: ownedRestaurant.image || null,
              imageFile: null,
              address: {
                street: ownedRestaurant.address?.street || "",
                city: ownedRestaurant.address?.city || "",
                state: ownedRestaurant.address?.state || "",
                zipCode: ownedRestaurant.address?.zipCode || "",
                country: ownedRestaurant.address?.country || "",
              },
              deliveryTimeMin: ownedRestaurant.deliveryTimeMin,
              deliveryTimeMax: ownedRestaurant.deliveryTimeMax,
              hasFreeDelivery: ownedRestaurant.hasFreeDelivery,
              discountPercent: ownedRestaurant.discountPercent,
            });

            if (ownedRestaurant.image) {
              setImagePreview(
                ownedRestaurant.image.startsWith("http")
                  ? ownedRestaurant.image
                  : `http://localhost:3006${ownedRestaurant.image}`
              );
            }
          }
        }

        setError(null);
      } catch (err) {
        setError("Failed to fetch restaurant details. Please try again later.");
        console.error("Error fetching restaurant:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [user?.id, restaurantId]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (name.includes(".")) {
      // Handle nested objects like address.street
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as Record<string, any>),
          [child]: value,
        },
      }));
    } else if (type === "checkbox") {
      const target = e.target as HTMLInputElement;
      setFormData((prev) => ({
        ...prev,
        [name]: target.checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert(
        `Image size (${(file.size / 1024 / 1024).toFixed(
          2
        )} MB) exceeds the 5MB limit.`
      );
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      alert("Only image files are allowed.");
      return;
    }

    // Create preview
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);

    // Store the file object (not base64)
    setFormData((prev) => ({
      ...prev,
      imageFile: file,
      image: null, // Clear any existing image path
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      if (!restaurant.deliveryZone) {
        throw new Error("Restaurant missing deliveryZone field.");
      }

      if (!restaurant.openingHours || restaurant.openingHours.length !== 7) {
        throw new Error("Restaurant missing complete opening hours.");
      }

      // Create a copy of formData to work with
      const updateData = {
        ...formData,
        deliveryZone: restaurant.deliveryZone,
        openingHours: restaurant.openingHours,
        address: {
          ...formData.address,
          location: restaurant.address?.location || {
            type: "Point",
            coordinates: [-73.9857, 40.7484], // Default to NYC
          },
        },
      };

      // Remove the imageFile property as it can't be serialized
      const { imageFile, ...dataToSubmit } = updateData;

      // If we have a new image file, upload it first
      if (formData.imageFile) {
        try {
          console.log("Uploading new image...");
          const imagePath = await uploadImage(formData.imageFile);
          console.log(`Image uploaded successfully, path: ${imagePath}`);

          // Set the new image path in the update data
          dataToSubmit.image = imagePath;
        } catch (uploadError) {
          console.error("Failed to upload image:", uploadError);
          setError("Failed to upload image. Please try again.");
          setLoading(false);
          return;
        }
      }

      console.log("Updating restaurant with data:", dataToSubmit);
      const updatedRestaurant = await updateRestaurant(
        restaurant._id,
        dataToSubmit
      );
      setSuccess("Restaurant profile updated successfully!");

      // Update the restaurant state with the updated data
      setRestaurant(updatedRestaurant);

      // Update the image preview if a new image was set
      if (updatedRestaurant.image) {
        const imagePath = updatedRestaurant.image.startsWith("http")
          ? updatedRestaurant.image
          : `${API_URL}${updatedRestaurant.image}`;
        setImagePreview(imagePath);
        setFormData((prev) => ({
          ...prev,
          image: updatedRestaurant.image,
          imageFile: null,
        }));
      }

      // Clear the imageFile property after successful update
      setFormData((prev) => ({ ...prev, imageFile: null }));
    } catch (err: any) {
      console.error("Error updating restaurant:", err);
      setError(
        err.response?.data?.error || "Failed to update restaurant profile."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading && !restaurant) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">No Restaurant Found</h2>
          <p className="text-gray-600 mb-6">
            You need to create a restaurant first.
          </p>
          <a
            href="/dashboard"
            className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <DashboardSidebar restaurantId={restaurant._id} />

        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-8">Restaurant Profile</h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Restaurant Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Restaurant Image
                </label>
                <div className="mt-1 flex items-center">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Restaurant Preview"
                        className="h-32 w-32 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setFormData((prev) => ({
                            ...prev,
                            image: null,
                            imageFile: null,
                          }));
                        }}
                        className="absolute top-0 right-0 -mr-2 -mt-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  ) : restaurant?.image ? (
                    <div className="relative">
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
                        alt="Restaurant Preview"
                        className="h-32 w-32 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            image: null,
                            imageFile: null,
                          }));
                          setImagePreview(null);
                        }}
                        className="absolute top-0 right-0 -mr-2 -mt-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer bg-gray-100 border border-gray-300 rounded-md p-2 hover:bg-gray-200 transition-colors">
                      <span className="text-sm text-gray-600">
                        Upload image
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Recommended: Square image, max 5MB
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cuisine
                  </label>
                  <input
                    type="text"
                    name="cuisine"
                    value={formData.cuisine}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price Range
                  </label>
                  <select
                    name="priceRange"
                    value={formData.priceRange}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select price range</option>
                    <option value="$">$ (Inexpensive)</option>
                    <option value="$$">$$ (Moderate)</option>
                    <option value="$$$">$$$ (Expensive)</option>
                    <option value="$$$$">$$$$ (Very Expensive)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isAvailable"
                    checked={formData.isAvailable}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    Restaurant is currently available for orders
                  </span>
                </label>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="text-lg font-medium mb-3">Address</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street
                    </label>
                    <input
                      type="text"
                      name="address.street"
                      value={formData.address.street}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State/Province
                    </label>
                    <input
                      type="text"
                      name="address.state"
                      value={formData.address.state}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP/Postal Code
                    </label>
                    <input
                      type="text"
                      name="address.zipCode"
                      value={formData.address.zipCode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      name="address.country"
                      value={formData.address.country}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Time (Min)
                  </label>
                  <input
                    type="number"
                    name="deliveryTimeMin"
                    value={formData.deliveryTimeMin ?? 15}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    min={5}
                    max={120}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Time (Max)
                  </label>
                  <input
                    type="number"
                    name="deliveryTimeMax"
                    value={formData.deliveryTimeMax ?? 30}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    min={5}
                    max={120}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Free Delivery
                  </label>
                  <input
                    type="checkbox"
                    name="hasFreeDelivery"
                    checked={!!formData.hasFreeDelivery}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        hasFreeDelivery: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount (%)
                  </label>
                  <select
                    name="discountPercent"
                    value={formData.discountPercent ?? 0}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {[...Array(13)].map((_, i) => (
                      <option key={i * 5} value={i * 5}>
                        {i * 5}%
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantProfilePage;
