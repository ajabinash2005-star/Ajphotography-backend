const EventRevenue = require("../models/EventRevenue");
const FrameRevenue = require("../models/FrameRevenue");

// ---------------- Event Revenue ----------------

exports.addEventRevenue = async (req, res, next) => {
  try {
    const revenue = await EventRevenue.create(req.body);

    res.status(201).json({
      success: true,
      data: revenue,
    });
  } catch (err) {
    next(err);
  }
};

exports.getEventRevenue = async (req, res, next) => {
  try {
    const revenue = await EventRevenue.find().sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      data: revenue,
    });
  } catch (err) {
    next(err);
  }
};

// ---------------- Frame Revenue ----------------

exports.addFrameRevenue = async (req, res, next) => {
  try {
    const revenue = await FrameRevenue.create(req.body);

    res.status(201).json({
      success: true,
      data: revenue,
    });
  } catch (err) {
    next(err);
  }
};

exports.getFrameRevenue = async (req, res, next) => {
  try {
    const revenue = await FrameRevenue.find().sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      data: revenue,
    });
  } catch (err) {
    next(err);
  }
};

// ---------------- Dashboard ----------------

exports.getRevenueDashboard = async (req, res, next) => {
  try {
    const eventRevenue = await EventRevenue.find();

    const frameRevenue = await FrameRevenue.find();

    const totalEventRevenue = eventRevenue.reduce(
      (sum, item) => sum + item.totalAmount,
      0
    );

    const totalFrameRevenue = frameRevenue.reduce(
      (sum, item) => sum + item.totalAmount,
      0
    );

    const totalEventProfit = eventRevenue.reduce(
      (sum, item) => sum + item.profit,
      0
    );

    const totalFrameProfit = frameRevenue.reduce(
      (sum, item) => sum + item.profit,
      0
    );

    res.json({
      success: true,

      totalRevenue:
        totalEventRevenue +
        totalFrameRevenue,

      totalProfit:
        totalEventProfit +
        totalFrameProfit,

      eventRevenue:
        totalEventRevenue,

      frameRevenue:
        totalFrameRevenue,

      eventProfit:
        totalEventProfit,

      frameProfit:
        totalFrameProfit,

      totalEvents:
        eventRevenue.length,

      totalFrames:
        frameRevenue.length,
    });
  } catch (err) {
    next(err);
  }
};