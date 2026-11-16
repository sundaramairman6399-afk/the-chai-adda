
const express = require("express");
const router = express.Router();

const {
  createOrder, getOrders, getMyOrders, getOrder,
  trackOrder, updateOrderStatus, updatePaymentStatus, cancelOrder,
} = require("../controllers/orderController");

const { authenticate, authorize, optionalAuth } = require("../middleware/auth");
const validate = require("../middleware/validate");
const orderValidators = require("../validators/orderValidator");

// Public order tracking
router.get("/track/:orderNumber", trackOrder);

// Customer — place order (optional auth — also works for guests)
router.post("/", optionalAuth, orderValidators.createOrder, validate, createOrder);

// Customer — own orders
router.get("/my", authenticate, getMyOrders);

// Admin / Staff
router.get("/", authenticate, authorize("admin", "staff"), getOrders);

// Single order
router.get("/:id", authenticate, getOrder);

// Status updates (admin/staff)
router.patch("/:id/status", authenticate, authorize("admin", "staff"), updateOrderStatus);
router.patch("/:id/payment", authenticate, authorize("admin"), updatePaymentStatus);

// Customer cancel
router.post("/:id/cancel", authenticate, cancelOrder);

module.exports = router;
