// src/services/restaurantService.ts
import axios from "axios";

const API_URL = "http://localhost:30006"; // Restaurant service URL

// Configure axios to include auth token in requests
const setAuthHeader = () => {
  const token = localStorage.getItem("token");
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
};

export const getAllRestaurants = async () => {
  try {
    const response = await axios.get(`${API_URL}/restaurants`);
    return response.data;
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    throw error;
  }
};

export const getRestaurantById = async (id: string) => {
  try {
    const response = await axios.get(`${API_URL}/restaurants/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching restaurant ${id}:`, error);
    throw error;
  }
};

export const createRestaurant = async (restaurantData: any) => {
  setAuthHeader();
  try {
    // Create a clean copy of the data to avoid modifying the original
    const processedData = { ...restaurantData };

    // Debug image data
    if (processedData.image) {
      // Skip processing if image is a URL path (from server)
      if (
        typeof processedData.image === "string" &&
        (processedData.image.startsWith("/uploads/") ||
          processedData.image.startsWith("http"))
      ) {
        console.log(
          "Create: Image is a server path, keeping as is:",
          processedData.image
        );
      } else {
        console.log(
          "Create: Image data exists, length:",
          processedData.image.length
        );

        // Check image size before sending (max 1MB)
        // Calculate size in KB for logging
        const imageSizeKB = (processedData.image.length * 0.75) / 1024; // base64 to binary conversion factor
        console.log(
          `Create: Approximate image size: ${imageSizeKB.toFixed(2)} KB`
        );

        if (processedData.image.length * 0.75 > 1024 * 1024) {
          console.error("Create: ERROR: Image exceeds 1MB size limit!");
          throw new Error("Image too large. Maximum size is 1MB");
        }

        // Check if the image data is still a full data URL
        if (processedData.image.startsWith("data:")) {
          console.log("Create: Image still has data URL prefix, fixing...");
          // Extract the actual base64 content after the comma
          const parts = processedData.image.split(",");
          if (parts.length > 1) {
            processedData.image = parts[1];
            console.log("Create: Successfully extracted base64 data");
          } else {
            console.error(
              "Create: ERROR: Malformed data URL, couldn't extract base64 data"
            );
            delete processedData.image;
            console.log(
              "Create: Removed invalid image data due to malformed URL"
            );
          }
        }

        // Ensure it's actually base64 and not undefined/null
        if (!processedData.image) {
          delete processedData.image;
          console.log("Create: Removed invalid/empty image data");
        } else {
          // Validate that it's actual base64 data
          try {
            // Try to decode a small sample as a sanity check
            const sample = processedData.image.substring(0, 100);
            atob(sample);
            console.log("Create: Base64 validation passed");

            // Further validation: check if the decoded data is non-empty
            if (processedData.image.trim() === "") {
              console.error("Create: Base64 data is empty after trimming");
              delete processedData.image;
            }

            // Check for invalid base64 characters
            if (!/^[A-Za-z0-9+/=]+$/.test(processedData.image)) {
              console.error("Create: Base64 data contains invalid characters");
              // Try to clean the string by removing invalid characters
              const cleanedBase64 = processedData.image.replace(
                /[^A-Za-z0-9+/=]/g,
                ""
              );
              if (cleanedBase64.length < processedData.image.length * 0.9) {
                // If we've lost more than 10% of characters, it's likely not valid
                console.error(
                  "Create: Too many invalid characters in base64 data"
                );
                delete processedData.image;
              } else {
                processedData.image = cleanedBase64;
                console.log(
                  "Create: Cleaned base64 data of invalid characters"
                );
              }
            }
          } catch (e) {
            console.error("Create: ERROR: Invalid base64 data:", e);
            delete processedData.image;
            console.log("Create: Removed invalid base64 data");
          }
        }
      }
    }

    console.log(
      "Creating restaurant with data:",
      JSON.stringify({
        ...processedData,
        image: processedData.image
          ? `${processedData.image.substring(0, 30)}... (truncated)`
          : null,
      })
    );

    console.log("Starting API request to create restaurant");
    const response = await axios.post(`${API_URL}/restaurants`, processedData);
    console.log("API request successful:", response.status);
    return response.data;
  } catch (error: any) {
    console.error("Error creating restaurant:", error);
    if (error.response) {
      console.error(
        "Server response error:",
        error.response.status,
        error.response.data
      );
    }
    throw error;
  }
};

export const updateRestaurant = async (id: string, restaurantData: any) => {
  setAuthHeader();
  try {
    // Create a clean copy of the data to avoid modifying the original
    const processedData = { ...restaurantData };

    // Ensure we have the location data for address
    if (processedData.address && !processedData.address.location) {
      processedData.address.location = {
        type: "Point",
        coordinates: [-73.9857, 40.7484], // Default coordinates if not provided
      };
    }

    // Debug image data
    if (processedData.image) {
      // Skip processing if image is a URL path (from server)
      if (
        typeof processedData.image === "string" &&
        (processedData.image.startsWith("/uploads/") ||
          processedData.image.startsWith("http"))
      ) {
        console.log(
          "Update: Image is a server path, keeping as is:",
          processedData.image
        );
      } else {
        console.log(
          "Update: Image data exists, length:",
          processedData.image.length
        );

        // Check image size before sending (max 1MB)
        // Calculate size in KB for logging
        const imageSizeKB = (processedData.image.length * 0.75) / 1024; // base64 to binary conversion factor
        console.log(
          `Update: Approximate image size: ${imageSizeKB.toFixed(2)} KB`
        );

        if (processedData.image.length * 0.75 > 1024 * 1024) {
          console.error("Update: ERROR: Image exceeds 1MB size limit!");
          throw new Error("Image too large. Maximum size is 1MB");
        }

        // Check if the image data is still a full data URL
        if (processedData.image.startsWith("data:")) {
          console.log("Update: Image still has data URL prefix, fixing...");
          // Extract the actual base64 content after the comma
          const parts = processedData.image.split(",");
          if (parts.length > 1) {
            processedData.image = parts[1];
            console.log("Update: Successfully extracted base64 data");
          } else {
            console.error(
              "Update: ERROR: Malformed data URL, couldn't extract base64 data"
            );
            delete processedData.image;
            console.log(
              "Update: Removed invalid image data due to malformed URL"
            );
          }
        }

        // Ensure it's actually base64 and not undefined/null
        if (!processedData.image) {
          delete processedData.image;
          console.log("Update: Removed invalid/empty image data");
        } else {
          // Validate that it's actual base64 data
          try {
            // Try to decode a small sample as a sanity check
            const sample = processedData.image.substring(0, 100);
            atob(sample);
            console.log("Update: Base64 validation passed");

            // Further validation: check if the decoded data is non-empty
            if (processedData.image.trim() === "") {
              console.error("Update: Base64 data is empty after trimming");
              delete processedData.image;
            }

            // Check for invalid base64 characters
            if (!/^[A-Za-z0-9+/=]+$/.test(processedData.image)) {
              console.error("Update: Base64 data contains invalid characters");
              // Try to clean the string by removing invalid characters
              const cleanedBase64 = processedData.image.replace(
                /[^A-Za-z0-9+/=]/g,
                ""
              );
              if (cleanedBase64.length < processedData.image.length * 0.9) {
                // If we've lost more than 10% of characters, it's likely not valid
                console.error(
                  "Update: Too many invalid characters in base64 data"
                );
                delete processedData.image;
              } else {
                processedData.image = cleanedBase64;
                console.log(
                  "Update: Cleaned base64 data of invalid characters"
                );
              }
            }
          } catch (e) {
            console.error("Update: ERROR: Invalid base64 data:", e);
            delete processedData.image;
            console.log("Update: Removed invalid base64 data");
          }
        }
      }
    }

    console.log(
      "Sending restaurant update data:",
      JSON.stringify({
        ...processedData,
        image: processedData.image
          ? `${processedData.image.substring(0, 30)}... (truncated)`
          : null,
      })
    );

    console.log("Starting API request to update restaurant");
    const response = await axios.patch(
      `${API_URL}/restaurants/${id}`,
      processedData
    );
    console.log("API request successful:", response.status);
    return response.data;
  } catch (error: any) {
    console.error(`Error updating restaurant ${id}:`, error);
    if (error.response) {
      console.error(
        "Server response error:",
        error.response.status,
        error.response.data
      );
    }
    throw error;
  }
};

export const addMenuItem = async (restaurantId: string, menuItemData: any) => {
  setAuthHeader();
  try {
    // Create a copy to avoid modifying original data
    const processedData = { ...menuItemData };

    // Debug image data
    if (processedData.image) {
      // Skip processing if image is a URL path (from server)
      if (
        processedData.image.startsWith("/uploads/") ||
        processedData.image.startsWith("http")
      ) {
        console.log(
          "AddMenuItem: Image is a server path, keeping as is:",
          processedData.image
        );
      } else {
        console.log(
          "AddMenuItem: Image data exists, length:",
          processedData.image.length
        );
        // Check if the image data is still a full data URL
        if (processedData.image.startsWith("data:")) {
          console.log(
            "AddMenuItem: Image still has data URL prefix, fixing..."
          );
          const parts = processedData.image.split(",");
          if (parts.length > 1) {
            processedData.image = parts[1];
          } else {
            delete processedData.image;
            console.log("AddMenuItem: Removed malformed data URL");
          }
        }
        // Ensure it's actually base64 and not undefined/null
        if (!processedData.image) {
          delete processedData.image;
          console.log("AddMenuItem: Removed invalid image data");
        }
      }
    }

    console.log(
      "Adding menu item with data:",
      JSON.stringify({
        ...processedData,
        image: processedData.image
          ? `${processedData.image.substring(0, 30)}... (truncated)`
          : null,
      })
    );

    const response = await axios.post(
      `${API_URL}/restaurants/${restaurantId}/menu`,
      processedData
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error adding menu item to restaurant ${restaurantId}:`,
      error
    );
    throw error;
  }
};

export const toggleItemAvailability = async (
  restaurantId: string,
  itemId: string
) => {
  setAuthHeader();
  try {
    const response = await axios.patch(
      `${API_URL}/restaurants/${restaurantId}/menu/${itemId}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error toggling menu item availability:`, error);
    throw error;
  }
};

// Helper function to calculate base64 data size in KB
const calculateBase64Size = (base64String: string) => {
  // If the string contains a data URL prefix, remove it
  const base64Data = base64String.includes(",")
    ? base64String.split(",")[1]
    : base64String;

  // Base64 to binary conversion factor is ~0.75
  return (base64Data.length * 0.75) / 1024;
};

export const updateMenuItem = async (
  restaurantId: string,
  itemId: string,
  itemData: any
) => {
  setAuthHeader();
  try {
    // Create a copy to avoid modifying original data
    const processedData = { ...itemData };

    // Check if image is a URL path, if so, keep as is
    if (
      processedData.image &&
      (processedData.image.startsWith("/uploads/") ||
        processedData.image.startsWith("http"))
    ) {
      console.log("Menu item update: Image is a server path, keeping as is");
    }
    // Check if image is base64 and too large (> 1MB)
    else if (processedData.image) {
      const imageSize = calculateBase64Size(processedData.image);
      console.log(
        `Menu item update: Image size is approximately ${imageSize.toFixed(
          2
        )} KB`
      );

      if (imageSize > 1024) {
        // If > 1MB
        throw new Error("Image too large. Maximum size is 1MB.");
      }

      // Handle data URL format
      if (processedData.image.startsWith("data:")) {
        console.log("Menu item update: Extracting base64 data from data URL");
        const parts = processedData.image.split(",");
        if (parts.length > 1) {
          processedData.image = parts[1];
        } else {
          delete processedData.image;
        }
      }
    }

    const response = await axios.put(
      `${API_URL}/restaurants/${restaurantId}/menu/${itemId}`,
      processedData
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating menu item:`, error);
    throw error;
  }
};

export const deleteMenuItem = async (restaurantId: string, itemId: string) => {
  setAuthHeader();
  try {
    const response = await axios.delete(
      `${API_URL}/restaurants/${restaurantId}/menu/${itemId}`
    );
    return response.data.restaurant;
  } catch (error) {
    console.error(`Error deleting menu item:`, error);
    throw error;
  }
};
