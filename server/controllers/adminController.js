
const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, sendError } = require("../utils/apiResponse");

// GET /api/admin/dashboard
const getDashboard = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalOrders,
    todayOrders,
    pendingOrders,
    totalRevenue,
    totalUsers,
    totalProducts,
  ] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ createdAt: { $gte: today } }),
    Order.countDocuments({ orderStatus: "pending" }),
    Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]),
    User.countDocuments({ role: "customer" }),
    Product.countDocuments({ isAvailable: true }),
  ]);

  const recentOrders = await Order.find()
    .sort("-createdAt")
    .limit(5)
    .select("orderNumber customerName totalAmount orderStatus paymentStatus createdAt");

  return sendSuccess(res, 200, "Dashboard data fetched", {
    stats: {
      totalOrders,
      todayOrders,
      pendingOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      totalUsers,
      totalProducts,
    },
    recentOrders,
  });
});

// GET /api/admin/users
const getUsers = asyncHandler(async (req, res) => {
  const { role, page = 1, limit = 20, search } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    User.find(filter).sort("-createdAt").skip(skip).limit(Number(limit)),
    User.countDocuments(filter),
  ]);

  return sendSuccess(res, 200, "Users fetched", {
    users,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
  });
});

// PATCH /api/admin/users/:id/role
const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!["customer", "staff", "admin"].includes(role)) {
    return sendError(res, 400, "Invalid role");
  }

  if (req.params.id === req.user.id) {
    return sendError(res, 400, "You cannot change your own role");
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true }
  );
  if (!user) return sendError(res, 404, "User not found");
  return sendSuccess(res, 200, "User role updated", { user });
});

// PATCH /api/admin/users/:id/status
const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return sendError(res, 404, "User not found");
  if (req.params.id === req.user.id) {
    return sendError(res, 400, "You cannot deactivate your own account");
  }

  user.isActive = !user.isActive;
  await user.save();
  return sendSuccess(res, 200, `User ${user.isActive ? "activated" : "deactivated"}`, { user });
});

module.exports = { getDashboard, getUsers, updateUserRole, toggleUserStatus };
