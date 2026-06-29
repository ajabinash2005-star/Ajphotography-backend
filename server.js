require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// ── Routes ─────────────────────────────────────────────
const authRoutes = require("./routes/authRoutes");
const photoRoutes = require("./routes/photoRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const dashboardRoutes = require('./routes/dashboardRoutes')
const revenueRoutes = require("./routes/revenueRoutes");

// ── Connect to MongoDB ─────────────────────────────────
connectDB();

const app = express();

// ── CORS ───────────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://ajphotography.vercel.app",
      "https://ajphotography-admin.vercel.app",
    ];
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, mobile apps, etc.)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: Origin '${origin}' not allowed.`));
      }
    },
    credentials: true,
  })
);

// ── Body parsers ───────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use("/api/revenue", revenueRoutes);

// ── Health check ───────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ── API routes ─────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/photos", photoRoutes);
app.use("/api/bookings", bookingRoutes);
app.use(

'/api/dashboard',

dashboardRoutes

)

// ── 404 handler ────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  });
});

// ── Global error handler ───────────────────────────────
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: errors.join(", ") });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: `${field} already exists.`,
    });
  }

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    return res
      .status(400)
      .json({ success: false, message: "Invalid ID format." });
  }

  // Multer errors
  if (err.name === "MulterError") {
    return res.status(400).json({ success: false, message: err.message });
  }

  // CORS error
  if (err.message && err.message.startsWith("CORS:")) {
    return res.status(403).json({ success: false, message: err.message });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Something went wrong."
        : err.message,
  });
});

// ── Start server ───────────────────────────────────────
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(
    `🚀 Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`
  );
});

// Graceful shutdown
const shutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(() => {
    console.log("✅ HTTP server closed.");
    process.exit(0);
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// Unhandled promise rejections
process.on("unhandledRejection", (reason) => {
  console.error("⚠️  Unhandled Rejection:", reason);
  server.close(() => process.exit(1));
});
