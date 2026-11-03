
const Order = require("../models/Order");

// POST /api/orders - Create a new order
const createOrder = async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      orderType,
      deliveryAddress,
      specialInstructions,
      items,
      utr,
      upiId
    } = req.body;

    // Validate customer details
    if (!customerName || !customerPhone || !orderType) {
      return res.status(400).json({
        success: false,
        message: "Customer name, phone and order type are required"
      });
    }

    if (!/^[0-9]{10}$/.test(customerPhone)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid 10-digit phone number"
      });
    }

    if (!["pickup", "delivery"].includes(orderType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order type"
      });
    }

    if (orderType === "delivery" && !deliveryAddress?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Delivery address is required"
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one order item is required"
      });
    }

    if (!utr || !utr.trim()) {
      return res.status(400).json({
        success: false,
        message: "UPI transaction reference is required"
      });
    }

    // IMPORTANT:
    // Replace this lookup with trusted server-side menu data
    // before accepting real customer payments.
    // Never trust prices submitted by the frontend.

    return res.status(501).json({
      success: false,
      message: "Server-side menu price verification must be configured before order creation."
    });

  } catch (error) {
    console.error("Create Order Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create order"
    });
  }
};


// GET /api/orders - Get all orders
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });

  } catch (error) {
    console.error("Get Orders Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders"
    });
  }
};

module.exports = {
  createOrder,
  getOrders
};
