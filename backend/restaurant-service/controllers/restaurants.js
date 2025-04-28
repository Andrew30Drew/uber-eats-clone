import Restaurant from "../models/Restaurant.js";

/**
 * Creates a new restaurant (owner only).
 * @param {Object} req - Express request (requires JWT with restaurant_owner role)
 * @param {Object} res - Express response
 */
export const createRestaurant = async (req, res) => {
  try {
    if (req.user.role !== "restaurant_owner") {
      return res.status(403).json({ error: "Forbidden: Owner role required" });
    }

    console.log(
      "[DEBUG] Creating restaurant. Request data:",
      JSON.stringify({
        ...req.body,
        image: req.body.image
          ? `${req.body.image.substring(0, 30)}... (truncated)`
          : null,
      })
    );

    // Make a copy of the request data we can manipulate
    const restaurantData = {
      ...req.body,
      ownerId: req.user.userId,
      menu: [],
      isAvailable: true,
      deliveryTimeMin: req.body.deliveryTimeMin ?? 15,
      deliveryTimeMax: req.body.deliveryTimeMax ?? 30,
      hasFreeDelivery: req.body.hasFreeDelivery ?? false,
      discountPercent: req.body.discountPercent ?? 0,
      reviewCount: req.body.reviewCount ?? 0,
    };

    // Log the openingHours and deliveryZone data structure
    console.log(
      "[DEBUG] Restaurant openingHours:",
      JSON.stringify(restaurantData.openingHours)
    );
    console.log(
      "[DEBUG] Restaurant deliveryZone:",
      JSON.stringify(restaurantData.deliveryZone)
    );

    // Validate required fields
    if (
      !restaurantData.name ||
      !restaurantData.description ||
      !restaurantData.cuisine
    ) {
      console.error("[ERROR] Missing required fields");
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!restaurantData.address) {
      console.error("[ERROR] Missing address data");
      return res.status(400).json({ error: "Address is required" });
    }

    if (!restaurantData.priceRange) {
      console.error("[ERROR] Missing price range");
      return res.status(400).json({ error: "Price range is required" });
    }

    // Validate openingHours and deliveryZone
    if (
      !restaurantData.openingHours ||
      !Array.isArray(restaurantData.openingHours)
    ) {
      console.error("[ERROR] Invalid or missing openingHours");
      return res.status(400).json({ error: "Opening hours must be an array" });
    }

    if (
      !restaurantData.deliveryZone ||
      !restaurantData.deliveryZone.type ||
      !restaurantData.deliveryZone.coordinates
    ) {
      console.error("[ERROR] Invalid or missing deliveryZone");
      return res
        .status(400)
        .json({ error: "Delivery zone must include type and coordinates" });
    }

    // Validate image size if provided (limit to 1MB)
    if (restaurantData.image) {
      try {
        // Check if image is a valid base64 string
        if (typeof restaurantData.image !== "string") {
          console.error(
            "[ERROR] Image is not a string:",
            typeof restaurantData.image
          );
          return res
            .status(400)
            .json({ error: "Invalid image format: not a string" });
        }

        // Check if image already has data URL prefix and remove it
        if (restaurantData.image.startsWith("data:")) {
          console.log("[DEBUG] Image still has data URL prefix, fixing...");
          restaurantData.image = restaurantData.image.split(",")[1];
        }

        // If after corrections the image is empty, null it out
        if (!restaurantData.image || restaurantData.image.trim() === "") {
          console.log(
            "[DEBUG] Image is empty after corrections, setting to null"
          );
          restaurantData.image = null;
        } else {
          // Test base64 decode
          try {
            console.log("[DEBUG] Attempting to decode base64 image data");
            const imageBuffer = Buffer.from(restaurantData.image, "base64");
            const imageSizeKB = imageBuffer.length / 1024;
            console.log(`[DEBUG] Image size: ${imageSizeKB.toFixed(2)} KB`);

            // Basic validation - check if decoded length is reasonable
            if (imageBuffer.length === 0) {
              console.error("[ERROR] Decoded image has zero length");
              return res
                .status(400)
                .json({ error: "Invalid image: decodes to zero bytes" });
            }

            // Check file size limit
            if (imageBuffer.length > 1024 * 1024) {
              console.error(
                `[ERROR] Image too large: ${imageSizeKB.toFixed(2)} KB`
              );
              return res
                .status(400)
                .json({ error: "Image too large. Maximum size is 1MB" });
            }

            // Basic validation check - see if it looks like an image
            const magicBytes = imageBuffer.slice(0, 4).toString("hex");
            console.log(`[DEBUG] Image magic bytes: ${magicBytes}`);
          } catch (decodeError) {
            console.error(
              "[ERROR] Failed to decode base64 image:",
              decodeError
            );
            return res.status(400).json({
              error: "Failed to decode base64 image",
              details: decodeError.message,
            });
          }
        }
      } catch (imageError) {
        console.error("[ERROR] Image processing error:", imageError);
        return res.status(400).json({
          error: "Invalid image format: " + imageError.message,
          details: "Image must be a valid base64 encoded string",
        });
      }
    }

    console.log("[DEBUG] Creating new Restaurant document");
    try {
      const restaurant = new Restaurant(restaurantData);
      console.log("[DEBUG] Restaurant model validation passed");

      await restaurant.save();
      console.log("[DEBUG] Restaurant saved successfully to database");
      res.status(201).json(restaurant);
    } catch (modelError) {
      console.error("[ERROR] Error creating Restaurant document:", modelError);
      if (modelError.name === "ValidationError") {
        console.error(
          "[ERROR] Validation errors:",
          JSON.stringify(modelError.errors)
        );
        return res.status(400).json({
          error: "Validation error",
          details: modelError.message,
          validationErrors: Object.keys(modelError.errors).map((field) => ({
            field,
            message: modelError.errors[field].message,
          })),
        });
      }
      throw modelError; // Re-throw to be caught by outer catch
    }
  } catch (error) {
    console.error("[ERROR] Restaurant creation error:", error);
    console.error("[ERROR] Stack trace:", error.stack);

    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({
      error: "Internal server error",
      message: error.message,
      stack: process.env.NODE_ENV !== "production" ? error.stack : undefined,
    });
  }
};

/**
 * Updates an existing restaurant (owner only).
 * @param {Object} req - Express request (requires JWT with restaurant_owner role)
 * @param {Object} res - Express response
 */
export const updateRestaurant = async (req, res) => {
  try {
    if (req.user.role !== "restaurant_owner") {
      return res.status(403).json({ error: "Forbidden: Owner role required" });
    }

    const debugBody = { ...req.body };
    if (debugBody.image) {
      debugBody.image = debugBody.image.substring(0, 30) + "... (truncated)";
    }

    console.log(
      "[DEBUG] Updating restaurant. Body:",
      JSON.stringify(debugBody, null, 2)
    );

    // Make a copy of the body we can manipulate
    const updateData = {
      ...req.body,
      deliveryTimeMin: req.body.deliveryTimeMin ?? 15,
      deliveryTimeMax: req.body.deliveryTimeMax ?? 30,
      hasFreeDelivery: req.body.hasFreeDelivery ?? false,
      discountPercent: req.body.discountPercent ?? 0,
      reviewCount: req.body.reviewCount ?? 0,
    };

    // Validate image size if provided (limit to 1MB)
    if (updateData.image) {
      try {
        // Check if image is a valid base64 string
        if (typeof updateData.image !== "string") {
          console.error(
            "[ERROR] Image is not a string:",
            typeof updateData.image
          );
          return res
            .status(400)
            .json({ error: "Invalid image format: not a string" });
        }

        // Check if image already has data URL prefix and remove it
        if (updateData.image.startsWith("data:")) {
          console.log("[DEBUG] Image still has data URL prefix, fixing...");
          updateData.image = updateData.image.split(",")[1];
        }

        // If after corrections the image is empty, null it out
        if (!updateData.image || updateData.image.trim() === "") {
          console.log(
            "[DEBUG] Image is empty after corrections, setting to null"
          );
          updateData.image = null;
        } else {
          // Test base64 decode
          try {
            console.log("[DEBUG] Attempting to decode base64 image data");
            const imageBuffer = Buffer.from(updateData.image, "base64");
            const imageSizeKB = imageBuffer.length / 1024;
            console.log(`[DEBUG] Image size: ${imageSizeKB.toFixed(2)} KB`);

            // Basic validation - check if decoded length is reasonable
            if (imageBuffer.length === 0) {
              console.error("[ERROR] Decoded image has zero length");
              return res
                .status(400)
                .json({ error: "Invalid image: decodes to zero bytes" });
            }

            // Check file size limit
            if (imageBuffer.length > 1024 * 1024) {
              console.error(
                `[ERROR] Image too large: ${imageSizeKB.toFixed(2)} KB`
              );
              return res
                .status(400)
                .json({ error: "Image too large. Maximum size is 1MB" });
            }

            // Basic validation check - see if it looks like an image
            const magicBytes = imageBuffer.slice(0, 4).toString("hex");
            console.log(`[DEBUG] Image magic bytes: ${magicBytes}`);
          } catch (decodeError) {
            console.error(
              "[ERROR] Failed to decode base64 image:",
              decodeError
            );
            return res.status(400).json({
              error: "Failed to decode base64 image",
              details: decodeError.message,
            });
          }
        }
      } catch (imageError) {
        console.error("[ERROR] Image processing error:", imageError);
        return res.status(400).json({
          error: "Invalid image format: " + imageError.message,
          details: "Image must be a valid base64 encoded string",
        });
      }
    }

    const restaurant = await Restaurant.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.user.userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!restaurant) {
      return res
        .status(404)
        .json({ error: "Restaurant not found or unauthorized" });
    }

    console.log("[DEBUG] Restaurant updated successfully");
    res.json(restaurant);
  } catch (error) {
    console.error("[ERROR] Restaurant update error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
};

/**
 * Adds a menu item to a restaurant (owner only).
 * @param {Object} req - Express request (requires JWT with restaurant_owner role)
 * @param {Object} res - Express response
 */
export const addMenuItem = async (req, res) => {
  try {
    if (req.user.role !== "restaurant_owner") {
      return res.status(403).json({ error: "Forbidden: Owner role required" });
    }

    console.log(
      "[DEBUG] Adding menu item. Data:",
      JSON.stringify({
        ...req.body,
        image: req.body.image
          ? `${req.body.image.substring(0, 30)}... (truncated)`
          : null,
      })
    );

    const restaurant = await Restaurant.findOne({
      _id: req.params.restaurantId,
      ownerId: req.user.userId,
    });

    if (!restaurant) {
      return res
        .status(404)
        .json({ error: "Restaurant not found or unauthorized" });
    }

    // Validate image size if provided (limit to 1MB)
    if (req.body.image) {
      try {
        const imageBuffer = Buffer.from(req.body.image, "base64");
        const imageSizeKB = imageBuffer.length / 1024;
        console.log(
          `[DEBUG] Menu item image size: ${imageSizeKB.toFixed(2)} KB`
        );

        if (imageBuffer.length > 1024 * 1024) {
          return res
            .status(400)
            .json({ error: "Image too large. Maximum size is 1MB" });
        }
      } catch (imageError) {
        console.error("[ERROR] Menu item image processing error:", imageError);
        return res.status(400).json({ error: "Invalid image format" });
      }
    }

    const newItem = {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      isAvailable: true,
      image: req.body.image || null,
      options: req.body.options || [],
      addOns: req.body.addOns || [],
    };

    restaurant.menu.push(newItem);
    await restaurant.save();

    console.log("[DEBUG] Menu item added successfully");
    res.status(201).json(restaurant);
  } catch (error) {
    console.error("[ERROR] Menu item addition error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
};

/**
 * Toggles a menu item's availability (owner only).
 * @param {Object} req - Express request (requires JWT with restaurant_owner role)
 * @param {Object} res - Express response
 */
export const toggleItemAvailability = async (req, res) => {
  try {
    if (req.user.role !== "restaurant_owner") {
      return res.status(403).json({ error: "Forbidden: Owner role required" });
    }

    const restaurant = await Restaurant.findOne({
      _id: req.params.restaurantId,
      ownerId: req.user.userId,
    });

    if (!restaurant) {
      return res
        .status(404)
        .json({ error: "Restaurant not found or unauthorized" });
    }

    const menuItem = restaurant.menu.id(req.params.itemId);
    if (!menuItem) {
      return res.status(404).json({ error: "Menu item not found" });
    }

    menuItem.isAvailable = !menuItem.isAvailable;
    await restaurant.save();

    res.json(restaurant);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Gets all active restaurants.
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
export const getRestaurants = async (req, res) => {
  try {
    console.log("[DEBUG] Attempting to fetch restaurants");
    const restaurants = await Restaurant.find({ isAvailable: true }).select(
      "-menu"
    );
    console.log("[DEBUG] Found restaurants:", restaurants);
    res.json(restaurants);
  } catch (error) {
    console.error("[ERROR] Error fetching restaurants:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Gets a specific restaurant by ID.
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
export const getRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Updates a menu item (owner only).
 * @param {Object} req - Express request (requires JWT with restaurant_owner role)
 * @param {Object} res - Express response
 */
export const updateMenuItem = async (req, res) => {
  try {
    if (req.user.role !== "restaurant_owner") {
      return res.status(403).json({ error: "Forbidden: Owner role required" });
    }

    console.log(
      "[DEBUG] Updating menu item. ItemId:",
      req.params.itemId,
      "Data:",
      JSON.stringify({
        ...req.body,
        image: req.body.image
          ? `${req.body.image.substring(0, 30)}... (truncated)`
          : null,
      })
    );

    const restaurant = await Restaurant.findOne({
      _id: req.params.restaurantId,
      ownerId: req.user.userId,
    });

    if (!restaurant) {
      return res
        .status(404)
        .json({ error: "Restaurant not found or unauthorized" });
    }

    const menuItem = restaurant.menu.id(req.params.itemId);
    if (!menuItem) {
      return res.status(404).json({ error: "Menu item not found" });
    }

    // Validate image size if provided (limit to 1MB)
    if (req.body.image) {
      try {
        const imageBuffer = Buffer.from(req.body.image, "base64");
        const imageSizeKB = imageBuffer.length / 1024;
        console.log(
          `[DEBUG] Menu item image size: ${imageSizeKB.toFixed(2)} KB`
        );

        if (imageBuffer.length > 1024 * 1024) {
          return res
            .status(400)
            .json({ error: "Image too large. Maximum size is 1MB" });
        }
      } catch (imageError) {
        console.error("[ERROR] Menu item image processing error:", imageError);
        return res.status(400).json({ error: "Invalid image format" });
      }
    }

    // Update menu item fields
    const updatableFields = [
      "name",
      "description",
      "price",
      "category",
      "image",
      "isAvailable",
    ];
    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        menuItem[field] = req.body[field];
      }
    });

    await restaurant.save();
    console.log("[DEBUG] Menu item updated successfully");
    res.json(restaurant);
  } catch (error) {
    console.error("[ERROR] Menu item update error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
};

/**
 * Deletes a menu item from a restaurant (owner only).
 * @param {Object} req - Express request (requires JWT with restaurant_owner role)
 * @param {Object} res - Express response
 */
export const deleteMenuItem = async (req, res) => {
  try {
    if (req.user.role !== "restaurant_owner") {
      return res.status(403).json({ error: "Forbidden: Owner role required" });
    }

    console.log(
      "[DEBUG] Deleting menu item. ItemId:",
      req.params.itemId,
      "From restaurant:",
      req.params.restaurantId
    );

    const restaurant = await Restaurant.findOne({
      _id: req.params.restaurantId,
      ownerId: req.user.userId,
    });

    if (!restaurant) {
      return res
        .status(404)
        .json({ error: "Restaurant not found or unauthorized" });
    }

    const menuItem = restaurant.menu.id(req.params.itemId);
    if (!menuItem) {
      return res.status(404).json({ error: "Menu item not found" });
    }

    // Remove the menu item
    menuItem.deleteOne();
    await restaurant.save();

    console.log("[DEBUG] Menu item deleted successfully");
    res.json({ message: "Menu item deleted successfully", restaurant });
  } catch (error) {
    console.error("[ERROR] Menu item deletion error:", error);
    res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
};
