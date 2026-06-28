const express = require("express");
const router = express.Router();
const {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  getBookingStats,
} = require("../controllers/bookingController");
const { protect } = require("../middleware/auth");

// ── Public routes ─────────────────────────────────────
router.post("/", createBooking);          // Client submits enquiry

// ── Protected routes (admin only) ────────────────────
router.get("/", protect, getAllBookings);
router.get("/stats", protect, getBookingStats);
router.get("/:id", protect, getBookingById);
router.put("/:id", protect, updateBooking);
router.delete("/:id", protect, deleteBooking);

module.exports = router;
