
const Product = require("../models/Product");
const Category = require("../models/Category");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, sendError } = require("../utils/apiResponse");

// GET /api/products
const getProducts = asyncHandler(async (req, res) => {
  const {
    category,
    search,
    available,
    sort = "displayOrder",
    page = 1,
    limit = 50,
  } = req.query;

  const filter = {};

  if (category) {
    // Accept category slug or ObjectId
    const cat = await Category.findOne({
      $or: [{ slug: category }, { _id: category.match(/^[a-f\d]{24}$/i) ? category : null }],
    });
    if (cat) filter.category = cat._id;
    else return sendSuccess(res, 200, "Products fetched", { products: [], total: 0 });
  }

  if (available === "true") filter.isAvailable = true;
  if (available === "false") filter.isAvailable = false;

  if (search) {
    filter.$text = { $search: search };
  }

  const sortMap = {
    displayOrder: { displayOrder: 1, name: 1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    name: { name: 1 },
  };
  const sortQuery = sortMap[sort] || { displayOrder: 1 };

  const skip = (Number(page) - 1) * Number(limit);

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("category", "name slug")
      .sort(sortQuery)
      .skip(skip)
      .limit(Number(limit)),
    Product.countDocuments(filter),
  ]);

  return sendSuccess(res, 200, "Products fetched", {
    products,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
  });
});

// GET /api/products/:id
const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate("category", "name slug");
  if (!product) return sendError(res, 404, "Product not found");
  return sendSuccess(res, 200, "Product fetched", { product });
});

// POST /api/products (admin)
const createProduct = asyncHandler(async (req, res) => {
  const {
    name, description, category, price, discountedPrice,
    variants, images, isVegetarian, isAvailable,
    preparationTime, customizations, tags, displayOrder,
  } = req.body;

  if (!name || !category || price === undefined) {
    return sendError(res, 400, "Name, category, and price are required");
  }

  const cat = await Category.findById(category);
  if (!cat) return sendError(res, 400, "Category not found");

  const product = await Product.create({
    name, description, category, price,
    discountedPrice: discountedPrice || null,
    variants: variants || [],
    images: images || [],
    isVegetarian: isVegetarian !== false,
    isAvailable: isAvailable !== false,
    preparationTime: preparationTime || 15,
    customizations: customizations || [],
    tags: tags || [],
    displayOrder: displayOrder || 0,
  });

  return sendSuccess(res, 201, "Product created", { product });
});

// PUT /api/products/:id (admin)
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate("category", "name slug");

  if (!product) return sendError(res, 404, "Product not found");
  return sendSuccess(res, 200, "Product updated", { product });
});

// DELETE /api/products/:id (admin)
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return sendError(res, 404, "Product not found");
  return sendSuccess(res, 200, "Product deleted");
});

// PATCH /api/products/:id/availability (admin/staff)
const toggleAvailability = asyncHandler(async (req, res) => {
  const { isAvailable } = req.body;
  if (typeof isAvailable !== "boolean") {
    return sendError(res, 400, "isAvailable must be a boolean");
  }

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { isAvailable },
    { new: true }
  );
  if (!product) return sendError(res, 404, "Product not found");
  return sendSuccess(res, 200, `Product marked ${isAvailable ? "available" : "unavailable"}`, { product });
});

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleAvailability,
};
