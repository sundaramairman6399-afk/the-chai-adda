
const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: [20, "Coupon code max 20 characters"],
    },
    description: { type: String, default: "", trim: true },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    discountValue: { type: Number, required: true, min: 0 },
    minimumOrderAmount: { type: Number, default: 0, min: 0 },
    maximumDiscount: { type: Number, default: null }, // cap for % coupons
    startDate: { type: Date, default: Date.now },
    expiryDate: { type: Date, required: true },
    usageLimit: { type: Number, default: null }, // null = unlimited
    usageCount: { type: Number, default: 0 },
    perUserUsageLimit: { type: Number, default: 1 },
    usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

couponSchema.index({ isActive: 1, expiryDate: 1 });

const Coupon = mongoose.model("Coupon", couponSchema);
module.exports = Coupon;
