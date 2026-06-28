const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    // ── Client info ─────────────────────────────────────
    clientName: {
      type: String,
      required: [true, "Client name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    clientEmail: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    clientPhone: {
      type: String,
      trim: true,
      match: [/^[+\d\s\-()]{7,20}$/, "Please enter a valid phone number"],
    },

    // ── Shoot details ────────────────────────────────────
    shootType: {
      type: String,
      required: [true, "Shoot type is required"],
      enum: {
        values: [
          "wedding",
          "portrait",
          "landscape",
          "commercial",
          "event",
          "fashion",
          "street",
          "travel",
          "other",
        ],
        message: "{VALUE} is not a valid shoot type",
      },
    },
    shootDate: {
      type: Date,
      required: [true, "Shoot date is required"],
    },
    duration: {
      type: Number, // in hours
      min: [1, "Duration must be at least 1 hour"],
      max: [24, "Duration cannot exceed 24 hours"],
    },
    location: {
      type: String,
      trim: true,
      maxlength: [200, "Location cannot exceed 200 characters"],
    },
    message: {
      type: String,
      trim: true,
      maxlength: [2000, "Message cannot exceed 2000 characters"],
    },

    // ── Status & admin ───────────────────────────────────
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    adminNotes: {
      type: String,
      trim: true,
      maxlength: [1000, "Notes cannot exceed 1000 characters"],
    },
    quotedPrice: {
      type: Number,
      min: 0,
    },
    currency: {
      type: String,
      default: "INR",
      uppercase: true,
    },
  },
  { timestamps: true }
);

bookingSchema.index({ status: 1, shootDate: 1 });
bookingSchema.index({ clientEmail: 1 });

module.exports = mongoose.model("Booking", bookingSchema);
