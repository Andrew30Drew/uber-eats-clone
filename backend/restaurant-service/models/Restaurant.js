import mongoose from "mongoose";

const DAYS_OF_WEEK = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];
const FOOD_CATEGORIES = ["appetizer", "main", "dessert", "beverage", "side"];

const openingHoursSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: DAYS_OF_WEEK,
      required: true,
    },
    open: {
      type: String,
      required: true,
      match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, // HH:MM format
    },
    close: {
      type: String,
      required: true,
      match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, // HH:MM format
    },
  },
  { _id: false }
);

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      default: null,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    options: [
      {
        name: { type: String, required: true }, // e.g., Size
        required: { type: Boolean, default: false },
        choices: [
          {
            label: { type: String, required: true }, // e.g., Small, Big
            price: { type: Number, default: 0 }, // price difference
          },
        ],
      },
    ],
    addOns: [
      {
        label: { type: String, required: true }, // e.g., Coca-Cola
        price: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

const addressSchema = new mongoose.Schema({
  street: {
    type: String,
    required: true,
    trim: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  state: {
    type: String,
    required: true,
    trim: true,
  },
  zipCode: {
    type: String,
    required: true,
    trim: true,
  },
  country: {
    type: String,
    required: true,
    trim: true,
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
});

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    cuisine: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      default: null,
    },
    address: {
      type: addressSchema,
      required: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    menu: [menuItemSchema],
    isAvailable: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    priceRange: {
      type: String,
      enum: ["$", "$$", "$$$", "$$$$"],
      required: true,
    },
    deliveryTimeMin: {
      type: Number,
      required: false,
      default: 15,
    },
    deliveryTimeMax: {
      type: Number,
      required: false,
      default: 30,
    },
    hasFreeDelivery: {
      type: Boolean,
      default: false,
    },
    discountPercent: {
      type: Number,
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    deliveryZone: {
      type: {
        type: String,
        enum: ["Polygon"],
        required: true,
      },
      coordinates: {
        type: [[[Number]]], // Array of arrays of coordinates forming polygons
        required: true,
      },
    },
    openingHours: {
      type: [openingHoursSchema],
      required: [true, "Opening hours are required"],
      validate: {
        validator: function (hours) {
          // Ensure all days of the week are present
          const days = hours.map((h) => h.day);
          return DAYS_OF_WEEK.every((day) => days.includes(day));
        },
        message: "Opening hours must be specified for all days of the week",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
restaurantSchema.index({ name: "text", description: "text", cuisine: "text" });
restaurantSchema.index({ "address.location": "2dsphere" });
restaurantSchema.index({ deliveryZone: "2dsphere" });

// Middleware to validate price ranges
restaurantSchema.pre("save", function (next) {
  if (this.menu) {
    const invalidItems = this.menu.filter((item) => item.price > 999.99);
    if (invalidItems.length > 0) {
      next(new Error("Menu item prices cannot exceed $999.99"));
    }
  }
  next();
});

const Restaurant = mongoose.model("Restaurant", restaurantSchema);

export default Restaurant;
