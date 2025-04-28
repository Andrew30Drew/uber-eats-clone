// src/pages/RestaurantMenuPage.tsx
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import DashboardSidebar from "../components/DashboardSidebar.tsx";
import RestaurantSelector from "../components/RestaurantSelector.tsx";
import {
  getRestaurantById,
  addMenuItem,
  toggleItemAvailability,
  updateMenuItem,
  deleteMenuItem,
} from "../services/restaurantService.ts";
import {
  Edit,
  Trash2,
  Plus,
  Check,
  X,
  Image as ImageIcon,
  Save,
  Loader,
  ToggleRight,
  ToggleLeft,
  FileEdit,
  AlertTriangle,
} from "lucide-react";

// Update API_URL to match the exact URL format used elsewhere
const API_URL = "http://localhost:30006"; // Restaurant service URL

/**
 * Helper function to properly format image URLs
 */
const getImageUrl = (imagePath: string | null | undefined): string | null => {
  if (!imagePath) return null;

  // If it already has a data URL prefix, use it as is
  if (imagePath.startsWith("data:")) {
    return imagePath;
  }

  // If it starts with http, it's a full URL
  if (imagePath.startsWith("http")) {
    return imagePath;
  }

  // Check if it's a server path
  if (imagePath.startsWith("/uploads/") || imagePath.startsWith("/")) {
    // It's a server path, construct the full URL
    return `${API_URL}${imagePath}`;
  }

  // Check if it's a base64 string. Base64 characters are A-Z, a-z, 0-9, +, /, and = at the end
  const base64Regex = /^[A-Za-z0-9+/]+=*$/;
  const isProbablyBase64 =
    base64Regex.test(imagePath) ||
    imagePath.startsWith("iVBOR") || // PNG
    imagePath.startsWith("/9j/") || // JPG
    imagePath.startsWith("PHN2Zy") || // SVG
    imagePath.startsWith("R0lGO") || // GIF
    imagePath.length > 100; // Long strings are likely base64 encoded data

  if (isProbablyBase64) {
    console.log("Detected base64 image, adding data URL prefix");
    return `data:image/png;base64,${imagePath}`;
  }

  // For any other format, assume it's a relative path
  return `${API_URL}/${imagePath}`;
};

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

const categories = [
  "Appetizers",
  "Main Course",
  "Desserts",
  "Beverages",
  "Sides",
  "Specials",
];

const RestaurantMenuPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const restaurantId = searchParams.get("restaurantId");
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [menuByCategory, setMenuByCategory] = useState<{
    [key: string]: MenuItem[];
  }>({});

  const fetchRestaurant = async (id: string) => {
    try {
      setLoading(true);
      const data = await getRestaurantById(id);
      setRestaurant(data);

      // Log the images in the menu items
      if (data.menu && data.menu.length > 0) {
        console.log("Menu items loaded, checking images:");
        data.menu.forEach((item: MenuItem) => {
          if (item.image) {
            console.log(`Menu item ${item.name} has image:`, item.image);
            console.log(`Resolved URL:`, getImageUrl(item.image));
          } else {
            console.log(`Menu item ${item.name} has no image`);
          }
        });
      }

      // Organize menu items by category
      const menuItems = data.menu || [];
      const byCategory: { [key: string]: MenuItem[] } = {};

      menuItems.forEach((item: MenuItem) => {
        if (!byCategory[item.category]) {
          byCategory[item.category] = [];
        }
        byCategory[item.category].push(item);
      });

      setMenuByCategory(byCategory);
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
    resetForm();
    setShowAddForm(false);
    setIsEditing(false);
  };

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

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!restaurantId) return;

    try {
      setSaving(true);
      setError(null);

      // Create a copy of the form data for submission
      const menuItemData = {
        ...formData,
        price: parseFloat(formData.price),
      };

      // No need to make any image adjustments here - the backend handles
      // processing the image data appropriately (removing data: prefix if needed)

      let updatedRestaurant;

      if (isEditing && editingItemId) {
        // Update existing menu item
        updatedRestaurant = await updateMenuItem(
          restaurantId,
          editingItemId,
          menuItemData
        );
        showSuccessMessage("Menu item updated successfully!");
      } else {
        // Add new menu item
        updatedRestaurant = await addMenuItem(restaurantId, menuItemData);
        showSuccessMessage("Menu item added successfully!");
      }

      setRestaurant(updatedRestaurant);

      // Organize menu items by category
      const menuItems = updatedRestaurant.menu || [];
      const byCategory: { [key: string]: MenuItem[] } = {};

      menuItems.forEach((item: MenuItem) => {
        if (!byCategory[item.category]) {
          byCategory[item.category] = [];
        }
        byCategory[item.category].push(item);
      });

      setMenuByCategory(byCategory);

      setShowAddForm(false);
      setIsEditing(false);
      setEditingItemId(null);
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to save menu item");
      console.error("Error saving menu item:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAvailability = async (itemId: string) => {
    if (!restaurantId) return;

    try {
      setLoading(true);
      const updatedRestaurant = await toggleItemAvailability(
        restaurantId,
        itemId
      );
      setRestaurant(updatedRestaurant);

      // Organize menu items by category
      const menuItems = updatedRestaurant.menu || [];
      const byCategory: { [key: string]: MenuItem[] } = {};

      menuItems.forEach((item: MenuItem) => {
        if (!byCategory[item.category]) {
          byCategory[item.category] = [];
        }
        byCategory[item.category].push(item);
      });

      setMenuByCategory(byCategory);

      showSuccessMessage("Item availability updated!");
    } catch (err: any) {
      setError(
        err.response?.data?.error || "Failed to update item availability"
      );
    } finally {
      setLoading(false);
    }
  };

  // Update the handleImageChange function with better logging
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 1MB)
    const fileSizeKB = file.size / 1024;
    console.log(
      `Menu: Selected image size: ${fileSizeKB.toFixed(2)} KB, type: ${
        file.type
      }, name: ${file.name}`
    );

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
      console.log(
        `Image loaded successfully. Data URL length: ${base64String.length}`
      );

      setImagePreview(base64String);
      setFormData((prev) => ({
        ...prev,
        image: base64String, // Store the full data URL
      }));
    };

    reader.onerror = (error) => {
      console.error("Error reading file:", error);
      alert(
        "There was an error reading the image file. Please try again with another image."
      );
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

    // Clear any file input elements
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach((input) => {
      (input as HTMLInputElement).value = "";
    });
  };

  // Update the handleEditItem function to properly handle base64 images
  const handleEditItem = (item: MenuItem) => {
    console.log("Editing item with image:", item.image);

    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      image: item.image || null,
    });

    if (item.image) {
      // Make sure to use getImageUrl to properly format the image URL
      const formattedImageUrl = getImageUrl(item.image);
      console.log("Setting image preview to:", formattedImageUrl);
      setImagePreview(formattedImageUrl);
    } else {
      setImagePreview(null);
    }

    setIsEditing(true);
    setEditingItemId(item._id);
    setShowAddForm(true);

    // Scroll to form
    setTimeout(() => {
      document
        .getElementById("menu-form")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingItemId(null);
    resetForm();
    setShowAddForm(false);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!restaurantId) return;

    if (!window.confirm("Are you sure you want to delete this menu item?")) {
      return;
    }

    try {
      setLoading(true);
      const updatedRestaurant = await deleteMenuItem(restaurantId, itemId);
      setRestaurant(updatedRestaurant);

      // Organize menu items by category
      const menuItems = updatedRestaurant.menu || [];
      const byCategory: { [key: string]: MenuItem[] } = {};

      menuItems.forEach((item: MenuItem) => {
        if (!byCategory[item.category]) {
          byCategory[item.category] = [];
        }
        byCategory[item.category].push(item);
      });

      setMenuByCategory(byCategory);

      showSuccessMessage("Menu item deleted successfully!");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to delete menu item");
    } finally {
      setLoading(false);
    }
  };

  const toggleItemExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <div className="flex flex-col md:flex-row bg-gray-50 min-h-screen">
      <div className="w-full md:w-64 mb-4 md:mb-0">
        <DashboardSidebar restaurantId={restaurantId || restaurant?._id} />
      </div>

      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Restaurant Menu</h1>

          <RestaurantSelector
            currentRestaurantId={restaurantId || undefined}
            onRestaurantChange={handleRestaurantChange}
            showCreateOption={true}
          />

          {loading ? (
            <div className="bg-white rounded-lg shadow-sm p-8 flex justify-center items-center min-h-[400px]">
              <div className="flex flex-col items-center">
                <div className="relative w-20 h-20">
                  <div className="absolute top-0 right-0 bg-primary h-6 w-6 rounded-full animate-ping opacity-75"></div>
                  <div className="absolute w-full h-full flex items-center justify-center animate-pulse">
                    <Loader className="h-10 w-10 text-primary animate-spin" />
                  </div>
                </div>
                <p className="text-gray-500 mt-4 text-center">
                  <span className="block font-medium text-gray-700 mb-1">
                    Loading menu items...
                  </span>
                  <span className="text-sm">This may take a moment</span>
                </p>
              </div>
            </div>
          ) : restaurant ? (
            <div className="space-y-8">
              {error && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-md flex items-start">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
                  <div>
                    <h3 className="text-red-800 font-medium">Error</h3>
                    <p className="text-red-700">{error}</p>
                  </div>
                </div>
              )}

              {successMessage && (
                <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-md flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                  <div>
                    <h3 className="text-green-800 font-medium">Success</h3>
                    <p className="text-green-700">{successMessage}</p>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-medium flex items-center">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                      <ImageIcon className="h-4 w-4 text-primary" />
                    </div>
                    Menu Items
                  </h2>
                  <button
                    onClick={() => {
                      setShowAddForm(!showAddForm);
                      setIsEditing(false);
                      resetForm();
                    }}
                    className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition-all shadow-sm hover:shadow transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    {showAddForm ? (
                      <>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Item
                      </>
                    )}
                  </button>
                </div>

                {restaurant.menu && restaurant.menu.length > 0 ? (
                  <div className="space-y-8">
                    {Object.keys(menuByCategory)
                      .sort()
                      .map((category) => (
                        <div
                          key={category}
                          className="border-t pt-6 first:border-0 first:pt-0"
                        >
                          <h3 className="text-lg font-medium mb-4 text-gray-800 flex items-center">
                            <span className="h-6 w-1 bg-primary rounded-full mr-2"></span>
                            {category}
                            <span className="ml-2 text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-1">
                              {menuByCategory[category].length} items
                            </span>
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {menuByCategory[category].map((item) => (
                              <div
                                key={item._id}
                                className={`border rounded-lg overflow-hidden ${
                                  item.isAvailable
                                    ? "bg-white border-gray-200"
                                    : "bg-gray-50 border-gray-200"
                                } shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1`}
                              >
                                <div className="flex p-4">
                                  <div className="w-20 h-20 flex-shrink-0 rounded-md overflow-hidden mr-4 bg-gray-100 shadow-sm">
                                    {item.image ? (
                                      <img
                                        src={
                                          getImageUrl(item.image) ||
                                          "https://placehold.co/80?text=No+Image"
                                        }
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          console.error(
                                            `Error loading image for ${item.name}:`,
                                            item.image
                                          );
                                          console.error(
                                            "Resolved URL:",
                                            getImageUrl(item.image)
                                          );
                                          (e.target as HTMLImageElement).src =
                                            "https://placehold.co/80?text=No+Image";
                                        }}
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <ImageIcon className="h-8 w-8 text-gray-300" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                      <h4 className="text-md font-medium truncate group-hover:text-primary">
                                        {item.name}
                                        {!item.isAvailable && (
                                          <span className="ml-2 text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                                            Unavailable
                                          </span>
                                        )}
                                      </h4>
                                      <span className="font-medium text-primary bg-primary/5 px-2 py-1 rounded-md text-sm">
                                        ${item.price.toFixed(2)}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-600 line-clamp-2 mt-1 mb-3">
                                      {item.description}
                                    </p>

                                    <div className="flex mt-auto space-x-2">
                                      <button
                                        onClick={() => handleEditItem(item)}
                                        className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded-md hover:bg-blue-50 transition-colors"
                                      >
                                        <Edit className="h-3 w-3 mr-1" />
                                        Edit
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleToggleAvailability(item._id)
                                        }
                                        className={`inline-flex items-center text-xs px-2 py-1 rounded-md transition-colors ${
                                          item.isAvailable
                                            ? "text-orange-600 hover:text-orange-800 hover:bg-orange-50"
                                            : "text-green-600 hover:text-green-800 hover:bg-green-50"
                                        }`}
                                      >
                                        {item.isAvailable ? (
                                          <>
                                            <ToggleRight className="h-3 w-3 mr-1" />
                                            Disable
                                          </>
                                        ) : (
                                          <>
                                            <ToggleLeft className="h-3 w-3 mr-1" />
                                            Enable
                                          </>
                                        )}
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleDeleteItem(item._id)
                                        }
                                        className="inline-flex items-center text-xs text-red-600 hover:text-red-800 px-2 py-1 rounded-md hover:bg-red-50 transition-colors"
                                      >
                                        <Trash2 className="h-3 w-3 mr-1" />
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg flex flex-col items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <ImageIcon className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-800 mb-2">
                      No Menu Items Yet
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md">
                      Get started by creating your first menu item. Each item
                      should have a name, description, price, and optionally an
                      image.
                    </p>
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="inline-flex items-center px-5 py-3 bg-gradient-to-r from-primary to-pink-600 text-white rounded-full text-sm font-medium hover:shadow-lg shadow-md transition-all transform hover:-translate-y-1 active:translate-y-0"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Add First Menu Item
                    </button>
                  </div>
                )}
              </div>

              {showAddForm && (
                <div
                  id="menu-form"
                  className="bg-white rounded-lg shadow-sm p-6 transform transition-all duration-300 hover:shadow-md"
                >
                  <h2 className="text-xl font-medium mb-6 flex items-center">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                      {isEditing ? (
                        <Edit className="h-4 w-4 text-primary" />
                      ) : (
                        <Plus className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    {isEditing ? "Edit Menu Item" : "Add Menu Item"}
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-8">
                      {/* Left column - Image upload */}
                      <div className="md:w-1/3">
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <ImageIcon className="h-4 w-4 mr-2 text-gray-500" />
                            Item Image
                          </label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center transition-all duration-300 hover:border-primary/50 hover:bg-primary/5">
                            <div className="mb-4">
                              {imagePreview ? (
                                <img
                                  src={imagePreview}
                                  alt="Preview"
                                  className="w-full h-48 object-cover rounded-lg mx-auto shadow-sm hover:shadow-md transition-shadow duration-300"
                                  onError={(e) => {
                                    console.error(
                                      "Error loading image preview:",
                                      imagePreview
                                    );
                                    console.error(
                                      "Image preview error details:",
                                      e
                                    );
                                    // Try again with direct data URL if not already
                                    if (
                                      formData.image &&
                                      !imagePreview.startsWith("data:")
                                    ) {
                                      try {
                                        const fixedUrl = `data:image/png;base64,${formData.image}`;
                                        console.log(
                                          "Trying with direct data URL:",
                                          fixedUrl.substring(0, 50) + "..."
                                        );
                                        (e.target as HTMLImageElement).src =
                                          fixedUrl;
                                        return;
                                      } catch (error) {
                                        console.error(
                                          "Failed to fix image URL:",
                                          error
                                        );
                                      }
                                    }
                                    (e.target as HTMLImageElement).src =
                                      "https://placehold.co/200?text=Image+Error";
                                  }}
                                />
                              ) : (
                                <div className="w-full h-48 bg-gray-100 flex items-center justify-center rounded-lg border border-gray-200">
                                  <div className="text-center">
                                    <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                    <p className="text-gray-500 text-sm">
                                      No image selected
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                            <label className="cursor-pointer bg-white border border-gray-300 hover:bg-primary/5 hover:border-primary/50 rounded-md py-2 px-4 text-sm font-medium text-gray-700 inline-flex items-center transition-colors shadow-sm hover:shadow">
                              <FileEdit className="h-4 w-4 mr-2" />
                              {imagePreview ? "Change Image" : "Upload Image"}
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageChange}
                              />
                            </label>
                            <p className="mt-2 text-xs text-gray-500">
                              Recommended: Square image, max 1MB.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Right column - Form fields */}
                      <div className="md:w-2/3 space-y-5">
                        <div className="group">
                          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center group-focus-within:text-primary transition-colors">
                            <span className="inline-block w-4 h-4 mr-2 bg-primary/10 rounded-full flex items-center justify-center text-xs text-primary">
                              1
                            </span>
                            Item Name
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                            placeholder="Enter item name..."
                            required
                          />
                        </div>

                        <div className="group">
                          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center group-focus-within:text-primary transition-colors">
                            <span className="inline-block w-4 h-4 mr-2 bg-primary/10 rounded-full flex items-center justify-center text-xs text-primary">
                              2
                            </span>
                            Description
                          </label>
                          <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={3}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                            placeholder="Describe your menu item..."
                            required
                          ></textarea>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="group">
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center group-focus-within:text-primary transition-colors">
                              <span className="inline-block w-4 h-4 mr-2 bg-primary/10 rounded-full flex items-center justify-center text-xs text-primary">
                                3
                              </span>
                              Category
                            </label>
                            <select
                              name="category"
                              value={formData.category}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors bg-white"
                              required
                            >
                              <option value="">Select category</option>
                              {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                  {cat}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="group">
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center group-focus-within:text-primary transition-colors">
                              <span className="inline-block w-4 h-4 mr-2 bg-primary/10 rounded-full flex items-center justify-center text-xs text-primary">
                                4
                              </span>
                              Price ($)
                            </label>
                            <input
                              type="number"
                              name="price"
                              value={formData.price}
                              onChange={handleInputChange}
                              step="0.01"
                              min="0"
                              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                              placeholder="0.00"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-6 border-t mt-4">
                      {isEditing && (
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        type="submit"
                        className="px-6 py-3 bg-gradient-to-r from-primary to-pink-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 inline-flex items-center"
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <Loader className="animate-spin h-5 w-5 mr-2" />
                            {isEditing ? "Updating..." : "Adding..."}
                          </>
                        ) : (
                          <>
                            <Save className="h-5 w-5 mr-2" />
                            {isEditing ? "Update Item" : "Add Item"}
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
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

export default RestaurantMenuPage;
