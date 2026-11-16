
const Coupon = require("../models/Coupon");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, sendError } = require("../utils/apiResponse");

// POST /api/coupons/validate (public)
const validateCoupon = asyncHandler(async (req, res) => {
  const { code, orderAmount } = req.body;
  if (!code) return sendError(res, 400, "Coupon code is required");

  const coupon = await Coupon.findOne({
    code: code.toUpperCase(),
    isActive: true,
    startDate: { $lte: new Date() },
    expiryDate: { $gte: new Date() },
  });

  if (!coupon) return sendError(res, 404, "Invalid or expired coupon code");

  if (orderAmount && orderAmount < coupon.minimumOrderAmount) {
    return sendError(
      res,
      400,
      `Minimum order amount for this coupon is ₹${coupon.minimumOrderAmount}`
    );
  }

  if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
    return sendError(res, 400, "This coupon has reached its usage limit");
  }

  let discountAmount = 0;
  if (orderAmount) {
    discountAmount =
      coupon.discountType === "percentage"
        ? Math.min(
            (orderAmount * coupon.discountValue) / 100,
            coupon.maximumDiscount || Infinity
          )
        : Math.min(coupon.discountValue, orderAmount);
  }

  return sendSuccess(res, 200, "Coupon is valid", {
    coupon: {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      maximumDiscount: coupon.maximumDiscount,
      minimumOrderAmount: coupon.minimumOrderAmount,
      description: coupon.description,
    },
    discountAmount: Math.round(discountAmount * 100) / 100,
  });
});

// GET /api/coupons (admin)
const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort("-createdAt").select("-usedBy");
  return sendSuccess(res, 200, "Coupons fetched", { coupons });
});

// POST /api/coupons (admin)
const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(req.body);
  return sendSuccess(res, 201, "Coupon created", { coupon });
});

// PUT /api/coupons/:id (admin)
const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!coupon) return sendError(res, 404, "Coupon not found");
  return sendSuccess(res, 200, "Coupon updated", { coupon });
});

// DELETE /api/coupons/:id (admin)
const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) return sendError(res, 404, "Coupon not found");
  return sendSuccess(res, 200, "Coupon deleted");
});

module.exports = { validateCoupon, getCoupons, createCoupon, updateCoupon, deleteCoupon };
