// src/pages/RestaurantDashboardPage.tsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.tsx";
import DashboardSidebar from "../components/DashboardSidebar.tsx";
import {
  getAllRestaurants,
  createRestaurant,
  updateRestaurant,
} from "../services/restaurantService.ts";
import { uploadImage } from "../services/imageService.ts";

interface Restaurant {
  _id: string;
  name: string;
  description: string;
  cuisine: string;
  priceRange: string;
  isAvailable: boolean;
  image?: string;
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
}

interface FormData {
  name: string;
  description: string;
  cuisine: string;
  priceRange: string;
  image: string | null;
  imageFile?: File | null;
  deliveryTimeMin: number;
  deliveryTimeMax: number;
  hasFreeDelivery: boolean;
  discountPercent: number;
  reviewCount: number;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    location: {
      type: string;
      coordinates: [number, number];
    };
  };
  openingHours: Array<{
    day: string;
    open: string;
    close: string;
  }>;
  deliveryZone: {
    type: string;
    coordinates: Array<Array<[number, number]>>;
  };
}

const RestaurantDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<string | null>(
    null
  );

  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    cuisine: "",
    priceRange: "$",
    image: null,
    imageFile: null,
    deliveryTimeMin: 15,
    deliveryTimeMax: 30,
    hasFreeDelivery: false,
    discountPercent: 0,
    reviewCount: 0,
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "USA",
      location: {
        type: "Point",
        coordinates: [-73.9857, 40.7484] as [number, number],
      },
    },
    openingHours: [
      { day: "monday", open: "09:00", close: "22:00" },
      { day: "tuesday", open: "09:00", close: "22:00" },
      { day: "wednesday", open: "09:00", close: "22:00" },
      { day: "thursday", open: "09:00", close: "22:00" },
      { day: "friday", open: "09:00", close: "23:00" },
      { day: "saturday", open: "10:00", close: "23:00" },
      { day: "sunday", open: "10:00", close: "22:00" },
    ],
    deliveryZone: {
      type: "Polygon",
      coordinates: [
        [
          [-74.006, 40.7128],
          [-74.006, 40.7328],
          [-73.986, 40.7328],
          [-73.986, 40.7128],
          [-74.006, 40.7128],
        ],
      ],
    },
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "restaurant_owner") {
      navigate("/");
      return;
    }

    fetchRestaurants();
  }, [user, navigate]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const data = await getAllRestaurants();
      // Filter to only show restaurants owned by the current user
      const ownedRestaurants = data.filter((r: any) => r.ownerId === user?.id);
      setRestaurants(ownedRestaurants);
      setError(null);
    } catch (err) {
      setError("Failed to fetch restaurants. Please try again later.");
      console.error("Error fetching restaurants:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as object),
          [child]: value,
        },
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
    if (!file) {
      console.log("No file selected");
      return;
    }

    console.log(
      `Selected file: ${file.name}, type: ${file.type}, size: ${file.size} bytes`
    );

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

    // Create preview from the file
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);

    // Store the file object to be uploaded when form is submitted
    setFormData((prev) => ({
      ...prev,
      imageFile: file,
      image: null,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      console.log("Restaurant submission starting...");
      console.log("Form data validation check...");

      // Validate required fields
      const requiredFields = ["name", "description", "cuisine", "priceRange"];
      for (const field of requiredFields) {
        if (!formData[field as keyof typeof formData]) {
          throw new Error(`${field} is required`);
        }
      }

      // Validate address fields
      const addressFields = ["street", "city", "state", "zipCode", "country"];
      for (const field of addressFields) {
        if (!formData.address[field as keyof typeof formData.address]) {
          throw new Error(`Address ${field} is required`);
        }
      }

      console.log("Form data validation passed");

      // Create a copy of formData without the imageFile property (which can't be serialized to JSON)
      const restaurantSubmitData = { ...formData };
      delete restaurantSubmitData.imageFile;

      // If there's an image file, upload it first
      if (formData.imageFile) {
        try {
          console.log("Uploading image file...");
          const imagePath = await uploadImage(formData.imageFile);
          console.log(`Image uploaded successfully, path: ${imagePath}`);

          // Set the image path in the restaurant data
          restaurantSubmitData.image = imagePath;
        } catch (uploadError) {
          console.error("Failed to upload image:", uploadError);
          setError("Failed to upload image. Please try again.");
          setLoading(false);
          return;
        }
      }

      // Explicitly log the request data
      console.log(
        "Restaurant submit data:",
        JSON.stringify({
          ...restaurantSubmitData,
          image: restaurantSubmitData.image || null,
        })
      );

      console.log("Calling createRestaurant API...");
      const newRestaurant = await createRestaurant(restaurantSubmitData);
      console.log("Restaurant created successfully:", newRestaurant._id);

      setRestaurants((prev) => [...prev, newRestaurant]);
      setShowCreateForm(false);

      // Reset form
      setFormData({
        name: "",
        description: "",
        cuisine: "",
        priceRange: "$",
        image: null,
        imageFile: null,
        deliveryTimeMin: 15,
        deliveryTimeMax: 30,
        hasFreeDelivery: false,
        discountPercent: 0,
        reviewCount: 0,
        address: {
          street: "",
          city: "",
          state: "",
          zipCode: "",
          country: "USA",
          location: {
            type: "Point",
            coordinates: [-73.9857, 40.7484],
          },
        },
        openingHours: [
          { day: "monday", open: "09:00", close: "22:00" },
          { day: "tuesday", open: "09:00", close: "22:00" },
          { day: "wednesday", open: "09:00", close: "22:00" },
          { day: "thursday", open: "09:00", close: "22:00" },
          { day: "friday", open: "09:00", close: "23:00" },
          { day: "saturday", open: "10:00", close: "23:00" },
          { day: "sunday", open: "10:00", close: "22:00" },
        ],
        deliveryZone: {
          type: "Polygon",
          coordinates: [
            [
              [-74.006, 40.7128],
              [-74.006, 40.7328],
              [-73.986, 40.7328],
              [-73.986, 40.7128],
              [-74.006, 40.7128],
            ],
          ],
        },
      });

      // Clear image preview
      setImagePreview(null);
    } catch (err: any) {
      console.error("Error in restaurant submission:", err);

      // Extract detailed error message from response if available
      let errorMessage = "Failed to create restaurant";

      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
        console.error("Server returned error:", errorMessage);

        // Check for validation details
        if (err.response.data.validationErrors) {
          console.error(
            "Validation errors:",
            err.response.data.validationErrors
          );
          const fieldErrors = err.response.data.validationErrors
            .map((ve: any) => `${ve.field}: ${ve.message}`)
            .join("; ");
          errorMessage += ` - ${fieldErrors}`;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (restaurant: Restaurant) => {
    // Instead of trying to copy potentially non-existent properties,
    // let's navigate to the profile page with the restaurant ID
    window.location.href = `/dashboard/profile?restaurantId=${restaurant._id}`;
  };

  // Get restaurantId for the sidebar if available
  const restaurantId = restaurants.length > 0 ? restaurants[0]._id : undefined;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <DashboardSidebar restaurantId={restaurantId} />

        <div className="flex-1">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">My Restaurants</h1>
            {!showCreateForm && !showEditForm && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors"
              >
                Create Restaurant
              </button>
            )}
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {loading && !showCreateForm ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : restaurants.length === 0 && !showCreateForm ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">
                You don't have any restaurants yet
              </h2>
              <p className="text-gray-600 mb-6">
                Create your first restaurant to start managing your menu and
                orders.
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors"
              >
                Create Your Restaurant
              </button>
            </div>
          ) : showCreateForm ? (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-6">
                Create New Restaurant
              </h2>

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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={3}
                    required
                  />
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
                      required
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
                      required
                    >
                      <option value="$">$ (Inexpensive)</option>
                      <option value="$$">$$ (Moderate)</option>
                      <option value="$$$">$$$ (Expensive)</option>
                      <option value="$$$$">$$$$ (Very Expensive)</option>
                    </select>
                  </div>
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
                            setFormData((prev) => ({ ...prev, image: null }));
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
                    Recommended: Square image, max 1MB
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Address</h3>
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
                        required
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Zip Code
                      </label>
                      <input
                        type="text"
                        name="address.zipCode"
                        value={formData.address.zipCode}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors"
                    disabled={loading}
                  >
                    {loading ? "Creating..." : "Create Restaurant"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {restaurants.map((restaurant) => (
                <div
                  key={restaurant._id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden"
                >
                  <div className="h-40 bg-gray-200 flex items-center justify-center">
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
                      <span className="text-gray-400">No Image</span>
                    )}
                  </div>
                  <div className="p-6">
                    <h2 className="text-xl font-semibold mb-2">
                      {restaurant.name}
                    </h2>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {restaurant.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          restaurant.isAvailable
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {restaurant.isAvailable ? "Active" : "Inactive"}
                      </span>
                      <div className="space-x-2">
                        <button
                          onClick={() => handleEditClick(restaurant)}
                          className="text-blue-600 hover:underline"
                        >
                          Edit
                        </button>
                        <Link
                          to={`/dashboard/menu?restaurantId=${restaurant._id}`}
                          className="text-primary hover:underline"
                        >
                          Manage Menu
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showEditForm && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Time (Min)
                  </label>
                  <input
                    type="number"
                    name="deliveryTimeMin"
                    value={formData.deliveryTimeMin}
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
                    value={formData.deliveryTimeMax}
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
                    checked={formData.hasFreeDelivery}
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
                    value={formData.discountPercent}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantDashboardPage;
