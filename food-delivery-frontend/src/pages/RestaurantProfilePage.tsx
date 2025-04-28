// src/pages/RestaurantProfilePage.tsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext.tsx";
import { useSearchParams, useNavigate } from "react-router-dom";
import DashboardSidebar from "../components/DashboardSidebar.tsx";
import RestaurantSelector from "../components/RestaurantSelector.tsx";
import {
  getAllRestaurants,
  getRestaurantById,
  updateRestaurant,
} from "../services/restaurantService.ts";
import { uploadImage } from "../services/imageService.ts";
import {
  Save,
  ImagePlus,
  Loader,
  FileEdit,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

const API_URL = "http://localhost:30006"; // Restaurant service URL

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
  const [searchParams, setSearchParams] = useSearchParams();
  const restaurantId = searchParams.get("restaurantId");
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  const fetchRestaurant = async (id: string) => {
    try {
      setLoading(true);
      const restaurantData = await getRestaurantById(id);
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
        if (restaurantData.image.startsWith("data:")) {
          setImagePreview(restaurantData.image);
        } else if (restaurantData.image.startsWith("http")) {
          setImagePreview(restaurantData.image);
        } else {
          setImagePreview(
            `http://localhost:30006${
              restaurantData.image.startsWith("/")
                ? restaurantData.image
                : `/${restaurantData.image}`
            }`
          );
        }
      } else {
        setImagePreview(null);
      }
      setError(null);
    } catch (err) {
      setError("Failed to fetch restaurant details. Please try again later.");
      console.error("Error fetching restaurant:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (restaurantId) {
      fetchRestaurant(restaurantId);
    } else {
      // If no restaurantId is provided, the RestaurantSelector will handle selecting the first restaurant
      setLoading(false);
    }
  }, [restaurantId]);

  const handleRestaurantChange = (id: string) => {
    setSearchParams({ restaurantId: id });
  };

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
      const { checked } = e.target as HTMLInputElement;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
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

    // Preview the image
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Set the file for upload
    setFormData((prev) => ({
      ...prev,
      imageFile: file,
      image: null, // Clear the previous image path
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      let imageUrl = formData.image;

      // If a new image file was selected, upload it first
      if (formData.imageFile) {
        imageUrl = await uploadImage(formData.imageFile);
      }

      // Update restaurant with image URL
      const updateData = {
        ...formData,
        image: imageUrl,
      };

      delete updateData.imageFile;

      const updatedRestaurant = await updateRestaurant(
        restaurant._id,
        updateData
      );
      setRestaurant(updatedRestaurant);
      setSuccess("Restaurant profile updated successfully!");

      // Reset image file after successful upload
      setFormData((prev) => ({
        ...prev,
        imageFile: null,
        image: imageUrl,
      }));
    } catch (err: any) {
      setError(err.message || "Failed to update restaurant profile.");
      console.error("Error updating restaurant:", err);
    } finally {
      setSaving(false);

      // Auto-dismiss success message after 3 seconds
      if (success) {
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      }
    }
  };

  return (
    <div className="flex flex-col md:flex-row bg-gray-50 min-h-screen">
      <div className="w-full md:w-64 mb-4 md:mb-0">
        <DashboardSidebar restaurantId={restaurantId || restaurant?._id} />
      </div>

      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Restaurant Profile</h1>

          <RestaurantSelector
            currentRestaurantId={restaurantId || undefined}
            onRestaurantChange={handleRestaurantChange}
            showCreateOption={true}
          />

          {loading ? (
            <div className="bg-white rounded-lg shadow-sm p-8 flex justify-center items-center min-h-[400px]">
              <div className="flex flex-col items-center">
                <Loader className="h-12 w-12 text-primary animate-spin mb-4" />
                <p className="text-gray-500">Loading restaurant details...</p>
              </div>
            </div>
          ) : restaurant ? (
            <div className="bg-white rounded-lg shadow-sm p-8">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md flex items-start">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
                  <div>
                    <h3 className="text-red-800 font-medium">Error</h3>
                    <p className="text-red-700">{error}</p>
                  </div>
                </div>
              )}

              {success && (
                <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-md flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                  <div>
                    <h3 className="text-green-800 font-medium">Success</h3>
                    <p className="text-green-700">{success}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Left column */}
                  <div className="md:w-1/3">
                    <div className="mb-6">
                      <h3 className="text-lg font-medium mb-4">
                        Restaurant Image
                      </h3>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <div className="mb-4">
                          {imagePreview ? (
                            <img
                              src={imagePreview}
                              alt={formData.name}
                              className="w-full h-48 object-cover rounded-lg mx-auto"
                              onError={(e) => {
                                console.error(
                                  "Error loading image:",
                                  imagePreview
                                );
                                (e.target as HTMLImageElement).src =
                                  "https://via.placeholder.com/200?text=No+Image";
                              }}
                            />
                          ) : (
                            <div className="w-full h-48 bg-gray-100 flex items-center justify-center rounded-lg">
                              <ImagePlus className="h-12 w-12 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <label className="cursor-pointer bg-white border border-gray-300 hover:bg-gray-50 rounded-md py-2 px-4 text-sm font-medium text-gray-700 inline-flex items-center transition-colors">
                          <FileEdit className="h-4 w-4 mr-2" />
                          Change Image
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                        </label>
                        <p className="mt-2 text-xs text-gray-500">
                          Upload a square image for best results. Max size: 1MB.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status
                        </label>
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="isAvailable"
                            checked={formData.isAvailable}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                          />
                          <span className="ml-2 text-gray-700">
                            Restaurant is active and available for orders
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Right column */}
                  <div className="md:w-2/3">
                    <h3 className="text-lg font-medium mb-4">
                      Basic Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Restaurant Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cuisine Type
                        </label>
                        <input
                          type="text"
                          name="cuisine"
                          value={formData.cuisine}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                        required
                      ></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Price Range
                        </label>
                        <select
                          name="priceRange"
                          value={formData.priceRange}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                          required
                        >
                          <option value="">Select price range</option>
                          <option value="$">$ (Inexpensive)</option>
                          <option value="$$">$$ (Moderate)</option>
                          <option value="$$$">$$$ (Expensive)</option>
                          <option value="$$$$">$$$$ (Very Expensive)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Delivery Time Min (minutes)
                        </label>
                        <input
                          type="number"
                          name="deliveryTimeMin"
                          value={formData.deliveryTimeMin || ""}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Delivery Time Max (minutes)
                        </label>
                        <input
                          type="number"
                          name="deliveryTimeMax"
                          value={formData.deliveryTimeMax || ""}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Discount Percentage
                        </label>
                        <input
                          type="number"
                          name="discountPercent"
                          value={formData.discountPercent || ""}
                          onChange={handleInputChange}
                          min="0"
                          max="100"
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                        />
                      </div>

                      <div className="flex items-center h-full pt-6">
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="hasFreeDelivery"
                            checked={formData.hasFreeDelivery || false}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                          />
                          <span className="ml-2 text-gray-700">
                            Offers Free Delivery
                          </span>
                        </label>
                      </div>
                    </div>

                    <h3 className="text-lg font-medium mb-4 mt-8">Address</h3>
                    <div className="grid grid-cols-1 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Street
                        </label>
                        <input
                          type="text"
                          name="address.street"
                          value={formData.address.street}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          name="address.city"
                          value={formData.address.city}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State
                        </label>
                        <input
                          type="text"
                          name="address.state"
                          value={formData.address.state}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Zip Code
                        </label>
                        <input
                          type="text"
                          name="address.zipCode"
                          value={formData.address.zipCode}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                          required
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
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-primary to-pink-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed inline-flex items-center"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader className="animate-spin h-5 w-5 mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <h2 className="text-xl font-medium mb-4 text-gray-800">
                No Restaurant Selected
              </h2>
              <p className="text-gray-600 mb-6">
                Please select a restaurant from above or create a new one.
              </p>
              <button
                onClick={() => navigate("/dashboard")}
                className="px-6 py-3 bg-primary text-white font-medium rounded-lg shadow-md hover:shadow-lg focus:outline-none transition-shadow"
              >
                Create Restaurant
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantProfilePage;
