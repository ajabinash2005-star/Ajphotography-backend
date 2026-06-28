const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

// ── Helpers ────────────────────────────────────────────────────────────────

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const sendToken = (admin, statusCode, res) => {
  const token = signToken(admin._id);
  res.status(statusCode).json({
    success: true,
    token,
    admin,
  });
};

// ── Controllers ────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 * Create the first admin account (restrict in production after first use).
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "name, email and password are required." });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res
        .status(409)
        .json({ success: false, message: "An admin with this email already exists." });
    }

    const admin = await Admin.create({ name, email, password });
    sendToken(admin, 201, res);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required." });
    }

    // Explicitly select password (it's excluded by default)
    const admin = await Admin.findOne({ email }).select("+password");
    if (!admin || !(await admin.comparePassword(password))) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password." });
    }

    // Record last login
    admin.lastLogin = new Date();
    await admin.save({ validateBeforeSave: false });

    sendToken(admin, 200, res);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me   (protected)
 */
exports.getMe = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, admin: req.admin });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/auth/change-password   (protected)
 */
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "currentPassword and newPassword are required.",
      });
    }

    const admin = await Admin.findById(req.admin._id).select("+password");
    if (!(await admin.comparePassword(currentPassword))) {
      return res
        .status(401)
        .json({ success: false, message: "Current password is incorrect." });
    }

    admin.password = newPassword;
    await admin.save();

    sendToken(admin, 200, res);
  } catch (error) {
    next(error);
  }
};
