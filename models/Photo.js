const mongoose = require("mongoose");

const photoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [120, "Title cannot exceed 120 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
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
        message: "{VALUE} is not a valid category",
      },
    },
    imageUrl: {
      type: String,
      required: [true, "Image URL is required"],
    },
    // Cloudinary public_id — needed for deletion
    cloudinaryPublicId: {
      type: String,
      required: true,
      select: false, // internal field, not exposed in list APIs
    },
    tags: {
      type: [String],
      default: [],
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0, // for manual sorting
    },
    // Optional metadata
    cameraMeta: {
      camera: String,
      lens: String,
      aperture: String,
      shutter: String,
      iso: String,
      location: String,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Text index for search
photoSchema.index({ title: "text", description: "text", tags: "text" });
photoSchema.index({ category: 1, isFeatured: 1 });

module.exports = mongoose.model("Photo", photoSchema);
