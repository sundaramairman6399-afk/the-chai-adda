
const express = require("express");
const router = express.Router();

const {
  register, login, logout, refresh,
  verifyEmail, forgotPassword, resetPassword, getMe,
} = require("../controllers/authController");

const { authenticate, optionalAuth } = require("../middleware/auth");
const validate = require("../middleware/validate");
const authValidators = require("../validators/authValidator");

router.post("/register", authValidators.register, validate, register);
router.post("/login", authValidators.login, validate, login);
router.post("/logout", optionalAuth, logout);
router.post("/refresh", refresh);
router.post("/verify-email", verifyEmail);
router.post("/forgot-password", authValidators.forgotPassword, validate, forgotPassword);
router.post("/reset-password", authValidators.resetPassword, validate, resetPassword);
router.get("/me", authenticate, getMe);

module.exports = router;
