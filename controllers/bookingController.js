const Booking = require("../models/Booking");

// ── POST /api/bookings  (public — client submits enquiry)  ───────────────
exports.createBooking = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      date,
      service,
      message,
    } = req.body;

    if (!name || !email || !service || !date) {
      return res.status(400).json({
        success: false,
        message: "Name, Email, Service and Date are required.",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return res.status(400).json({
        success: false,
        message: "Shoot date cannot be in the past.",
      });
    }

    const booking = await Booking.create({
      clientName: name,
      clientEmail: email,
      clientPhone: phone,
      shootType: service,
      shootDate: date,
      message,
    });

    res.status(201).json({
      success: true,
      message: "Booking request submitted successfully!",
      data: booking,
    });

  } catch (error) {
    console.error(error);
    next(error);
  }
};

// ── GET /api/bookings  (protected — admin only)  ─────────────────────────
exports.getAllBookings = async (req, res, next) => {
  try {
    const {
      status,
      shootType,
      page = 1,
      limit = 20,
      sort = "-createdAt",
      from,
      to,
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (shootType) filter.shootType = shootType;
    if (from || to) {
      filter.shootDate = {};
      if (from) filter.shootDate.$gte = new Date(from);
      if (to) filter.shootDate.$lte = new Date(to);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [bookings, total] = await Promise.all([
      Booking.find(filter).sort(sort).skip(skip).limit(Number(limit)),
      Booking.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/bookings/:id  (protected)  ──────────────────────────────────
exports.getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found." });
    }
    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

// ── PUT /api/bookings/:id  (protected — update status, price, notes)  ────
exports.updateBooking = async (req, res, next) => {
  try {
    const allowed = ["status", "adminNotes", "quotedPrice", "currency"];
    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const booking = await Booking.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found." });
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

// ── DELETE /api/bookings/:id  (protected)  ───────────────────────────────
exports.deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found." });
    }
    res.status(200).json({ success: true, message: "Booking deleted." });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/bookings/stats  (protected)  ────────────────────────────────
exports.getBookingStats = async (req, res, next) => {
  try {
    const stats = await Booking.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalRevenue: { $sum: "$quotedPrice" },
        },
      },
    ]);

    const byShootType = await Booking.aggregate([
      { $group: { _id: "$shootType", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: { byStatus: stats, byShootType },
    });
  } catch (error) {
    next(error);
  }
};
