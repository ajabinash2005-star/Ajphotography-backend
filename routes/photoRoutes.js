const express = require("express");
const router = express.Router();
const {
  getAllPhotos,
  getPhotoById,
  uploadPhoto,
  updatePhoto,
  deletePhoto,
  getCategories,
} = require("../controllers/photoController");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");

// ── Public routes ─────────────────────────────────────
router.get("/", getAllPhotos);
router.get("/categories", getCategories);
router.get("/:id", getPhotoById);

// ── Protected routes (admin only) ────────────────────
router.post("/", protect, upload.single("image"), uploadPhoto);
router.put("/:id", protect, upload.single("image"), updatePhoto);
router.delete("/:id", protect, deletePhoto);

module.exports = router;
