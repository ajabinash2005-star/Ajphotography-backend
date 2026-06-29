const mongoose = require("mongoose");

const frameRevenueSchema = new mongoose.Schema(
  {
    frameBy: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      default: "",
    },

    frameSize: {
      type: String,
      required: true,
    },

    frameType: {
      type: String,
      default: "",
    },

    quantity: {
      type: Number,
      default: 1,
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

    deliveryDate: {
      type: Date,
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

module.exports = mongoose.model("FrameRevenue", frameRevenueSchema);