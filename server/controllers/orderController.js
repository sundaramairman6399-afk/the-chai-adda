
const Order = require("../models/Order");
const Product = require("../models/Product");
const Coupon = require("../models/Coupon");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, sendError } = require("../utils/apiResponse");
const { sendOrderConfirmationEmail } = require("../services/emailService");

const DELIVERY_FEE = 30; // flat delivery fee in ₹
const TAX_RATE = 0;       // set to e.g. 0.05 for 5% GST if needed

// POST /api/orders
const createOrder = asyncHandler(async (req, res) => {
  const {
    customerName,
    customerPhone,
    customerEmail,
    orderType,
    deliveryAddress,
    specialInstructions,
    items,       // [{ productId, variantLabel?, quantity, specialNote? }]
    utr,
    couponCode,
  } = req.body;

  // ----- Server-side price verification -----
  const resolvedItems = [];
  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) return sendError(res, 400, `Product ${item.productId} not found`);
    if (!product.isAvailable) return sendError(res, 400, `${product.name} is currently unavailable`);

    let unitPrice = product.price;

    // If a variant was selected, verify it exists and use its price
    if (item.variantLabel && product.variants.length > 0) {
      const variant = product.variants.find(
        (v) => v.label.toLowerCase() === item.variantLabel.toLowerCase()
      );
      if (!variant) return sendError(res, 400, `Variant '${item.variantLabel}' not found for ${product.name}`);
      unitPrice = variant.price;
    } else if (item.variantLabel && product.variants.length === 0) {
      return sendError(res, 400, `${product.name} does not have variants`);
    }

    const lineTotal = unitPrice * item.quantity;
    resolvedItems.push({
      productId: product._id,
      name: product.name,
      variantLabel: item.variantLabel || "",
      unitPrice,
      quantity: item.quantity,
      lineTotal,
      specialNote: item.specialNote || "",
    });
  }

  const subtotal = resolvedItems.reduce((sum, i) => sum + i.lineTotal, 0);

  // ----- Coupon validation -----
  let discount = 0;
  let usedCoupon = null;

  if (couponCode) {
    const coupon = await Coupon.findOne({
      code: couponCode.toUpperCase(),
      isActive: true,
      startDate: { $lte: new Date() },
      expiryDate: { $gte: new Date() },
    });

    if (!coupon) return sendError(res, 400, "Invalid or expired coupon code");
    if (subtotal < coupon.minimumOrderAmount) {
      return sendError(res, 400, `Minimum order amount for this coupon is ₹${coupon.minimumOrderAmount}`);
    }
    if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
      return sendError(res, 400, "This coupon has reached its usage limit");
    }
    if (req.user) {
      const userUsed = coupon.usedBy.filter(
        (uid) => uid.toString() === req.user.id
      ).length;
      if (userUsed >= coupon.perUserUsageLimit) {
        return sendError(res, 400, "You have already used this coupon");
      }
    }

    discount =
      coupon.discountType === "percentage"
        ? Math.min(
            (subtotal * coupon.discountValue) / 100,
            coupon.maximumDiscount || Infinity
          )
        : Math.min(coupon.discountValue, subtotal);

    usedCoupon = coupon;
  }

  const deliveryFee = orderType === "delivery" ? DELIVERY_FEE : 0;
  const tax = Math.round((subtotal - discount) * TAX_RATE * 100) / 100;
  const totalAmount = Math.max(0, subtotal - discount + deliveryFee + tax);

  // ----- Create order -----
  const order = await Order.create({
    userId: req.user?.id || null,
    customerName,
    customerEmail: customerEmail || "",
    customerPhone,
    items: resolvedItems,
    orderType,
    deliveryAddress: deliveryAddress || "",
    specialInstructions: specialInstructions || "",
    subtotal,
    discount,
    couponCode: couponCode || "",
    deliveryFee,
    tax,
    totalAmount,
    paymentMethod: "upi",
    paymentStatus: "pending",
    utr: utr || "",
    orderStatus: "pending",
    statusHistory: [{ status: "pending", note: "Order placed", updatedBy: req.user?.id }],
    estimatedReadyAt: new Date(Date.now() + 20 * 60 * 1000),
  });

  // Update coupon usage
  if (usedCoupon) {
    usedCoupon.usageCount += 1;
    if (req.user) usedCoupon.usedBy.push(req.user.id);
    await usedCoupon.save();
  }

  // Send confirmation email (non-blocking)
  if (customerEmail) {
    sendOrderConfirmationEmail({ name: customerName }, order).catch((e) =>
      console.error("[Order] Email failed:", e.message)
    );
  }

  return sendSuccess(res, 201, "Order placed successfully", { order });
});

// GET /api/orders (admin/staff)
const getOrders = asyncHandler(async (req, res) => {
  const {
    status,
    paymentStatus,
    page = 1,
    limit = 20,
    sort = "-createdAt",
  } = req.query;

  const filter = {};
  if (status) filter.orderStatus = status;
  if (paymentStatus) filter.paymentStatus = paymentStatus;

  const skip = (Number(page) - 1) * Number(limit);
  const [orders, total] = await Promise.all([
    Order.find(filter).sort(sort).skip(skip).limit(Number(limit)),
    Order.countDocuments(filter),
  ]);

  return sendSuccess(res, 200, "Orders fetched", {
    orders,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
  });
});

// GET /api/orders/my (customer — own orders)
const getMyOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const [orders, total] = await Promise.all([
    Order.find({ userId: req.user.id }).sort("-createdAt").skip(skip).limit(Number(limit)),
    Order.countDocuments({ userId: req.user.id }),
  ]);

  return sendSuccess(res, 200, "Your orders fetched", {
    orders,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
  });
});

// GET /api/orders/:id (customer — own order OR admin/staff)
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return sendError(res, 404, "Order not found");

  // Customers can only view their own orders
  if (
    req.user.role === "customer" &&
    order.userId?.toString() !== req.user.id
  ) {
    return sendError(res, 403, "Access denied");
  }

  return sendSuccess(res, 200, "Order fetched", { order });
});

// GET /api/orders/track/:orderNumber (public — by order number)
const trackOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ orderNumber: req.params.orderNumber }).select(
    "orderNumber orderStatus estimatedReadyAt orderType createdAt"
  );
  if (!order) return sendError(res, 404, "Order not found");
  return sendSuccess(res, 200, "Order found", { order });
});

// PATCH /api/orders/:id/status (admin/staff)
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;

  const validStatuses = [
    "pending", "confirmed", "preparing", "ready",
    "out_for_delivery", "delivered", "cancelled", "rejected",
  ];
  if (!validStatuses.includes(status)) {
    return sendError(res, 400, "Invalid order status");
  }

  const order = await Order.findById(req.params.id);
  if (!order) return sendError(res, 404, "Order not found");

  order.orderStatus = status;
  order.statusHistory.push({
    status,
    note: note || "",
    updatedBy: req.user.id,
    timestamp: new Date(),
  });

  if (status === "cancelled" || status === "rejected") {
    order.cancelledAt = new Date();
    order.cancelReason = note || "";
  }

  await order.save();
  return sendSuccess(res, 200, "Order status updated", { order });
});

// PATCH /api/orders/:id/payment (admin)
const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { paymentStatus } = req.body;
  const valid = ["pending", "paid", "failed", "refunded"];
  if (!valid.includes(paymentStatus)) {
    return sendError(res, 400, "Invalid payment status");
  }

  const order = await Order.findById(req.params.id);
  if (!order) return sendError(res, 404, "Order not found");

  order.paymentStatus = paymentStatus;
  if (paymentStatus === "paid" && order.orderStatus === "pending") {
    order.orderStatus = "confirmed";
    order.statusHistory.push({
      status: "confirmed",
      note: "Payment verified",
      updatedBy: req.user.id,
    });
  }

  await order.save();
  return sendSuccess(res, 200, "Payment status updated", { order });
});

// POST /api/orders/:id/cancel (customer — cancel own order)
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return sendError(res, 404, "Order not found");

  if (order.userId?.toString() !== req.user.id) {
    return sendError(res, 403, "Access denied");
  }

  const cancellableStatuses = ["pending", "confirmed"];
  if (!cancellableStatuses.includes(order.orderStatus)) {
    return sendError(res, 400, "This order cannot be cancelled at its current stage");
  }

  order.orderStatus = "cancelled";
  order.cancelledAt = new Date();
  order.cancelReason = req.body.reason || "Cancelled by customer";
  order.statusHistory.push({
    status: "cancelled",
    note: order.cancelReason,
    updatedBy: req.user.id,
  });

  await order.save();
  return sendSuccess(res, 200, "Order cancelled", { order });
});

module.exports = {
  createOrder,
  getOrders,
  getMyOrders,
  getOrder,
  trackOrder,
  updateOrderStatus,
  updatePaymentStatus,
  cancelOrder,
};
