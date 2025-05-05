import mongoose from "mongoose";

const deliverySchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Driver",
    required: true,
  },
  status: {
    type: String,
    enum: ["Assigned", "Picked Up", "On the Way", "Delivered"],
    default: "Assigned",
  },
  assignedAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  pickupLocation: {
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
  deliveryLocation: {
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

// Update the updatedAt timestamp before saving
deliverySchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Index for geospatial queries
deliverySchema.index({ pickupLocation: "2dsphere" });
deliverySchema.index({ deliveryLocation: "2dsphere" });

const Delivery = mongoose.model("Delivery", deliverySchema);

export default Delivery;
