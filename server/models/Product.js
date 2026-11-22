
const mongoose = require("mongoose");

const customizationOptionSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    extraPrice: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const customizationGroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    required: { type: Boolean, default: false },
    options: [customizationOptionSchema],
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [120, "Name cannot exceed 120 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    // Base price — always used for server-side verification
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    // Optional discounted price
    discountedPrice: {
      type: Number,
      min: 0,
      default: null,
    },
    // Size variants: [{ label: 'Small', price: 160 }, ...]
    variants: {
      type: [
        {
          label: { type: String, required: true },
          price: { type: Number, required: true, min: 0 },
          _id: false,
        },
      ],
      default: [],
    },
    images: {
      type: [String],
      default: [],
    },
    isVegetarian: { type: Boolean, default: true },
    isAvailable: { type: Boolean, default: true },
    preparationTime: { type: Number, default: 15, min: 1 }, // minutes
    customizations: [customizationGroupSchema],
    tags: { type: [String], default: [] },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Auto-generate slug from name
productSchema.pre("save", function (next) {
  if (this.isModified("name") && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }
  next();
});

productSchema.index({ category: 1 });
productSchema.index({ isAvailable: 1 });
productSchema.index({ name: "text", description: "text" });

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
