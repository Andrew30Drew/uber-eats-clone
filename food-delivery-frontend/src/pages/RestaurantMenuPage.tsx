// src/pages/RestaurantMenuPage.tsx
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import DashboardSidebar from "../components/DashboardSidebar.tsx";
import {
  getRestaurantById,
  addMenuItem,
  toggleItemAvailability,
  updateMenuItem,
  deleteMenuItem,
} from "../services/restaurantService.ts";

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
  menu: MenuItem[];
}

const RestaurantMenuPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const restaurantId = searchParams.get("restaurantId");

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: null as string | null,
  });

  // Add state for image preview
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Add these states
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!restaurantId) return;

      try {
        setLoading(true);
        const data = await getRestaurantById(restaurantId);
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
  }, [restaurantId]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!restaurantId) return;

    try {
      setLoading(true);

      const menuItemData = {
        ...formData,
        price: parseFloat(formData.price),
      };

      let updatedRestaurant;

      if (isEditing && editingItemId) {
        // Update existing menu item
        updatedRestaurant = await updateMenuItem(
          restaurantId,
          editingItemId,
          menuItemData
        );
      } else {
        // Add new menu item
        updatedRestaurant = await addMenuItem(restaurantId, menuItemData);
      }

      setRestaurant(updatedRestaurant);
      setShowAddForm(false);
      setIsEditing(false);
      setEditingItemId(null);
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to save menu item");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async (itemId: string) => {
    if (!restaurantId) return;

    try {
      const updatedRestaurant = await toggleItemAvailability(
        restaurantId,
        itemId
      );
      setRestaurant(updatedRestaurant);
    } catch (err: any) {
      setError(
        err.response?.data?.error || "Failed to update item availability"
      );
    }
  };

  // Add this function to handle image uploads
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 1MB)
    const fileSizeKB = file.size / 1024;
    console.log(`Menu: Selected image size: ${fileSizeKB.toFixed(2)} KB`);

    if (file.size > 1024 * 1024) {
      alert(
        `Image size (${(file.size / 1024 / 1024).toFixed(
          2
        )} MB) exceeds the 1MB limit. Please select a smaller image.`
      );
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = base64String.split(",")[1];

      // Calculate the expected size after base64 encoding
      const estimatedSize = base64Data.length * 0.75; // Convert base64 length to binary size
      console.log(
        `Menu: Estimated binary size after encoding: ${(
          estimatedSize / 1024
        ).toFixed(2)} KB`
      );

      if (estimatedSize > 1024 * 1024) {
        alert(
          `Encoded image size (${(estimatedSize / 1024 / 1024).toFixed(
            2
          )} MB) exceeds the 1MB limit. Please select a smaller image.`
        );
        return;
      }

      setImagePreview(base64String);
      setFormData((prev) => ({
        ...prev,
        image: base64Data,
      }));
    };
    reader.readAsDataURL(file);
  };

  // Reset form including image
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
      image: null,
    });
    setImagePreview(null);
  };

  // Add this function to handle edit button click
  const handleEditItem = (item: MenuItem) => {
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      image: item.image || null,
    });

    if (item.image) {
      if (item.image.startsWith("http") || item.image.startsWith("/uploads/")) {
        // For URL paths, create a full URL
        setImagePreview(
          `http://localhost:3006${
            item.image.startsWith("/") ? item.image : `/${item.image}`
          }`
        );
      } else {
        // For base64 data
        setImagePreview(`data:image/jpeg;base64,${item.image}`);
      }
    } else {
      setImagePreview(null);
    }

    setEditingItemId(item._id);
    setIsEditing(true);
    setShowAddForm(true);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!restaurantId) return;

    if (
      !window.confirm(
        "Are you sure you want to delete this menu item? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      const updatedRestaurant = await deleteMenuItem(restaurantId, itemId);
      setRestaurant(updatedRestaurant);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to delete menu item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <DashboardSidebar restaurantId={restaurantId || undefined} />

        <div className="flex-1">
          {!restaurantId ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              No restaurant selected. Please go back to the dashboard and select
              a restaurant.
            </div>
          ) : loading && !restaurant ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : error || !restaurant ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error || "Restaurant not found"}
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Menu Management</h1>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors"
                >
                  Add Menu Item
                </button>
              </div>

              <h2 className="text-xl font-semibold mb-6">{restaurant.name}</h2>

              {showAddForm && (
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                  <h3 className="text-lg font-medium mb-4">
                    {isEditing ? "Edit Menu Item" : "Add New Menu Item"}
                  </h3>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Item Name
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
                          Price ($)
                        </label>
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          step="0.01"
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category
                        </label>
                        <input
                          type="text"
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          required
                          placeholder="e.g. appetizer, main, dessert"
                        />
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Menu Item Image
                      </label>
                      <div className="mt-1 flex items-center">
                        {imagePreview ? (
                          <div className="relative">
                            <img
                              src={imagePreview}
                              alt="Menu Item Preview"
                              className="h-32 w-32 object-cover rounded-md"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setImagePreview(null);
                                setFormData((prev) => ({
                                  ...prev,
                                  image: null,
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

                    <div className="flex justify-end space-x-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddForm(false);
                          setIsEditing(false);
                          setEditingItemId(null);
                          resetForm();
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors"
                        disabled={loading}
                      >
                        {loading
                          ? "Saving..."
                          : isEditing
                          ? "Update Item"
                          : "Add Item"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {restaurant.menu.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                  <h3 className="text-lg font-medium mb-2">
                    No menu items yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Add your first menu item to start offering your delicious
                    food to customers.
                  </p>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors"
                  >
                    Add Your First Menu Item
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Item
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Category
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Price
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {restaurant.menu.map((item) => (
                        <tr key={item._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {item.image ? (
                                <div className="flex-shrink-0 h-10 w-10 mr-4">
                                  <img
                                    src={
                                      item.image.startsWith("http") ||
                                      item.image.startsWith("/uploads/")
                                        ? `http://localhost:3006${
                                            item.image.startsWith("/")
                                              ? item.image
                                              : `/${item.image}`
                                          }`
                                        : `data:image/jpeg;base64,${item.image}`
                                    }
                                    alt={item.name}
                                    className="h-10 w-10 rounded-full object-cover"
                                  />
                                </div>
                              ) : null}
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {item.name}
                                </div>
                                <div className="text-sm text-gray-500 line-clamp-1">
                                  {item.description}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {item.category}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              ${item.price.toFixed(2)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                item.isAvailable
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {item.isAvailable ? "Available" : "Unavailable"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-4">
                              <button
                                onClick={() =>
                                  handleToggleAvailability(item._id)
                                }
                                className="text-primary hover:text-primary-hover"
                              >
                                {item.isAvailable ? "Disable" : "Enable"}
                              </button>
                              <button
                                onClick={() => handleEditItem(item)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item._id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantMenuPage;
