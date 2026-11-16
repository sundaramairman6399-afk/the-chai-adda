
const { body } = require("express-validator");

const orderValidators = {
  createOrder: [
    body("customerName").trim().notEmpty().withMessage("Customer name is required"),
    body("customerPhone")
      .matches(/^[0-9]{10}$/)
      .withMessage("Valid 10-digit phone number is required"),
    body("customerEmail").optional().isEmail().withMessage("Invalid email format").normalizeEmail(),
    body("orderType")
      .isIn(["pickup", "delivery"])
      .withMessage("Order type must be pickup or delivery"),
    body("deliveryAddress")
      .if(body("orderType").equals("delivery"))
      .trim()
      .notEmpty()
      .withMessage("Delivery address is required for delivery orders"),
    body("items").isArray({ min: 1 }).withMessage("At least one item is required"),
    body("items.*.productId").notEmpty().withMessage("Product ID is required for each item"),
    body("items.*.quantity")
      .isInt({ min: 1 })
      .withMessage("Quantity must be at least 1 for each item"),
    body("items.*.variantLabel").optional().isString(),
    body("utr").optional().trim(),
    body("couponCode").optional().trim().toUpperCase(),
  ],
};

module.exports = orderValidators;
