const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { cloudinary } = require("../config/cloudinary");

// Store images directly in Cloudinary — no local disk needed
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const category = req.body.category || "uncategorized";
    return {
      folder: `portfolio/${category}`,
      allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
      transformation: [
        { quality: "auto:best" },
        { fetch_format: "auto" },
      ],
      // Keep original filename as part of public_id
      public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
    };
  },
});

// File filter — images only
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpg, jpeg, png, webp, gif)"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15 MB max
  },
});

module.exports = upload;
