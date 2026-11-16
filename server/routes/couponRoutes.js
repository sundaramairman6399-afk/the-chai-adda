
const express = require("express");
const router = express.Router();

const {
  validateCoupon, getCoupons, createCoupon, updateCoupon, deleteCoupon,
} = require("../controllers/couponController");

const { authenticate, authorize } = require("../middleware/auth");

// Public coupon validation
router.post("/validate", validateCoupon);

// Admin
router.get("/", authenticate, authorize("admin"), getCoupons);
router.post("/", authenticate, authorize("admin"), createCoupon);
router.put("/:id", authenticate, authorize("admin"), updateCoupon);
router.delete("/:id", authenticate, authorize("admin"), deleteCoupon);

module.exports = router;
