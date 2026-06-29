const mongoose = require("mongoose");

const eventRevenueSchema = new mongoose.Schema(
  {
    eventName: {
      type: String,
      required: true,
      trim: true,
    },

    eventBy: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      default: "",
    },

    location: {
      type: String,
      required: true,
    },

    eventDate: {
      type: Date,
      required: true,
    },

    packageName: {
      type: String,
      default: "",
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    profit: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Partial", "Paid"],
      default: "Pending",
    },

    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("EventRevenue", eventRevenueSchema);