const { body } = require("express-validator");

const orderValidators = {
  createOrder: [
    body("customerName")
      .trim()
      .notEmpty().withMessage("Customer name is required")
      .isLength({ max: 80 }).withMessage("Customer name must be 80 characters or fewer"),
    body("customerPhone")
      .matches(/^[0-9]{10}$/)
      .withMessage("Valid 10-digit phone number is required"),
    body("customerEmail")
      .optional({ checkFalsy: true })
      .isEmail().withMessage("Invalid email format")
      .isLength({ max: 254 }).withMessage("Email is too long")
      .normalizeEmail(),
    body("orderType")
      .isIn(["pickup", "delivery"])
      .withMessage("Order type must be pickup or delivery"),
    body("deliveryAddress")
      .if(body("orderType").equals("delivery"))
      .trim()
      .notEmpty().withMessage("Delivery address is required for delivery orders")
      .isLength({ max: 300 }).withMessage("Delivery address must be 300 characters or fewer"),
    body("deliveryAddress")
      .optional({ checkFalsy: true })
      .isString().withMessage("Delivery address must be text")
      .isLength({ max: 300 }).withMessage("Delivery address must be 300 characters or fewer"),
    body("specialInstructions")
      .optional({ checkFalsy: true })
      .isString()
      .trim()
      .isLength({ max: 500 }).withMessage("Special instructions must be 500 characters or fewer"),
    body("items")
      .isArray({ min: 1, max: 30 })
      .withMessage("An order must contain between 1 and 30 items"),
    body("items.*.productId")
      .isMongoId()
      .withMessage("A valid product ID is required for each item"),
    body("items.*.quantity")
      .isInt({ min: 1, max: 50 })
      .withMessage("Each item quantity must be between 1 and 50"),
    body("items.*.variantLabel")
      .optional({ checkFalsy: true })
      .isString()
      .trim()
      .isLength({ max: 40 })
      .withMessage("Variant label must be 40 characters or fewer"),
    body("items.*.specialNote")
      .optional({ checkFalsy: true })
      .isString()
      .trim()
      .isLength({ max: 200 })
      .withMessage("Item note must be 200 characters or fewer"),
    body("utr")
      .optional({ checkFalsy: true })
      .isString()
      .trim()
      .isLength({ max: 50 })
      .withMessage("UPI reference must be 50 characters or fewer"),
    body("couponCode")
      .optional({ checkFalsy: true })
      .isString()
      .trim()
      .toUpperCase()
      .isLength({ max: 20 })
      .withMessage("Coupon code must be 20 characters or fewer"),
  ],
};

module.exports = orderValidators;
