
const mongoose = require("mongoose");

// Schema for individual food items
const orderItemSchema = new mongoose.Schema(
  {
    menuItemId: {
      type: Number,
      required: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    price: {
      type: Number,
      required: true,
      min: 0
    },

    quantity: {
      type: Number,
      required: true,
      min: 1
    },

    lineTotal: {
      type: Number,
      required: true,
      min: 0
    }
  },
  { _id: false }
);

// Schema for payment details
const paymentSchema = new mongoose.Schema(
  {
    method: {
      type: String,
      enum: ["upi"],
      default: "upi"
    },

    upiId: {
      type: String,
      default: ""
    },

    utr: {
      type: String,
      required: true,
      trim: true
    },

    status: {
      type: String,
      enum: [
        "pending_verification",
        "verified",
        "rejected"
      ],
      default: "pending_verification"
    }
  },
  { _id: false }
);

// Main Order Schema
const orderSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
      trim: true
    },

    customerPhone: {
      type: String,
      required: true,
      match: /^[0-9]{10}$/
    },

    orderType: {
      type: String,
      enum: ["pickup", "delivery"],
      required: true
    },

    deliveryAddress: {
      type: String,
      default: "",
      trim: true
    },

    specialInstructions: {
      type: String,
      default: "",
      trim: true
    },

    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: items => items.length > 0,
        message: "An order must contain at least one item"
      }
    },

    totalItems: {
      type: Number,
      required: true,
      min: 1
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },

    payment: {
      type: paymentSchema,
      required: true
    },

    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "rejected",
        "completed",
        "cancelled"
      ],
      default: "pending"
    }
  },
  {
    timestamps: true
  }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
