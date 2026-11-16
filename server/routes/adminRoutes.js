
const express = require("express");
const router = express.Router();

const {
  getDashboard, getUsers, updateUserRole, toggleUserStatus,
} = require("../controllers/adminController");

const { authenticate, authorize } = require("../middleware/auth");

router.use(authenticate, authorize("admin"));

router.get("/dashboard", getDashboard);
router.get("/users", getUsers);
router.patch("/users/:id/role", updateUserRole);
router.patch("/users/:id/status", toggleUserStatus);

module.exports = router;
