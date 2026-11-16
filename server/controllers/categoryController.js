
const Category = require("../models/Category");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, sendError } = require("../utils/apiResponse");

// GET /api/categories
const getCategories = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.active !== "false") filter.isActive = true;

  const categories = await Category.find(filter).sort({ displayOrder: 1, name: 1 });
  return sendSuccess(res, 200, "Categories fetched", { categories });
});

// GET /api/categories/:id
const getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) return sendError(res, 404, "Category not found");
  return sendSuccess(res, 200, "Category fetched", { category });
});

// POST /api/categories (admin)
const createCategory = asyncHandler(async (req, res) => {
  const { name, description, image, isActive, displayOrder } = req.body;
  if (!name) return sendError(res, 400, "Category name is required");

  const category = await Category.create({
    name,
    description: description || "",
    image: image || "",
    isActive: isActive !== false,
    displayOrder: displayOrder || 0,
  });

  return sendSuccess(res, 201, "Category created", { category });
});

// PUT /api/categories/:id (admin)
const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!category) return sendError(res, 404, "Category not found");
  return sendSuccess(res, 200, "Category updated", { category });
});

// DELETE /api/categories/:id (admin)
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) return sendError(res, 404, "Category not found");
  return sendSuccess(res, 200, "Category deleted");
});

module.exports = { getCategories, getCategory, createCategory, updateCategory, deleteCategory };
