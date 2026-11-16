
const express = require("express");
const router = express.Router();

const {
  getProducts, getProduct, createProduct, updateProduct, deleteProduct, toggleAvailability,
} = require("../controllers/productController");

const { authenticate, authorize } = require("../middleware/auth");

// Public routes
router.get("/", getProducts);
router.get("/:id", getProduct);

// Admin-only routes
router.post("/", authenticate, authorize("admin"), createProduct);
router.put("/:id", authenticate, authorize("admin"), updateProduct);
router.delete("/:id", authenticate, authorize("admin"), deleteProduct);
router.patch("/:id/availability", authenticate, authorize("admin", "staff"), toggleAvailability);

module.exports = router;
