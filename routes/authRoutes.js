const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getMe,
  changePassword,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");

// Public
router.post("/register", register);
router.post("/login", login);

// Protected
router.get("/me", protect, getMe);
router.put("/change-password", protect, changePassword);

module.exports = router;
