
const mongoose = require("mongoose");
const generateOrderNumber = require("../utils/generateOrderNumber");

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    // Variant label if applicable (e.g. "Medium")
    variantLabel: { type: String, default: "" },
    // Server-verified unit price
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    lineTotal: { type: Number, required: true, min: 0 },
    specialNote: { type: String, default: "", trim: true },
  },
  { _id: false }
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    note: { type: String, default: "" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
    },
    // Nullable — guest orders allowed
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, trim: true, default: "" },
    customerPhone: {
      type: String,
      required: true,
      match: [/^[0-9]{10}$/, "Phone must be 10 digits"],
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: (v) => v.length > 0,
        message: "Order must have at least one item",
      },
    },
    orderType: {
      type: String,
      enum: ["pickup", "delivery"],
      required: true,
    },
    deliveryAddress: { type: String, default: "", trim: true },
    specialInstructions: { type: String, default: "", trim: true },

    // Pricing (all server-computed)
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    couponCode: { type: String, default: "" },
    deliveryFee: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },

    // Payment
    paymentMethod: {
      type: String,
      enum: ["upi", "cash", "card", "online"],
      default: "upi",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    utr: { type: String, default: "", trim: true }, // UPI transaction ref

    // Order lifecycle
    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "preparing",
        "ready",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "rejected",
      ],
      default: "pending",
    },
    statusHistory: [statusHistorySchema],

    estimatedReadyAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    cancelReason: { type: String, default: "" },
  },
  { timestamps: true }
);

// Auto-generate orderNumber before first save
orderSchema.pre("save", function (next) {
  if (this.isNew && !this.orderNumber) {
    this.orderNumber = generateOrderNumber();
  }
  next();
});

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1, createdAt: -1 });
orderSchema.index({ customerPhone: 1 });

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
