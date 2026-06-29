const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/auth");

const {
  addEventRevenue,
  getEventRevenue,
  addFrameRevenue,
  getFrameRevenue,
  getRevenueDashboard,
} = require("../controllers/revenueController");

router.post("/events", protect, addEventRevenue);

router.get("/events", protect, getEventRevenue);

router.post("/frames", protect, addFrameRevenue);

router.get("/frames", protect, getFrameRevenue);

router.get("/dashboard", protect, getRevenueDashboard);

module.exports = router;