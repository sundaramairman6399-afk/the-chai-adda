
const crypto = require("crypto");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, sendError } = require("../utils/apiResponse");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateSecureToken,
} = require("../services/tokenService");
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require("../services/emailService");

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  const existing = await User.findOne({ email });
  if (existing) return sendError(res, 409, "An account with this email already exists");

  const verificationToken = generateSecureToken();
  const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

  const user = await User.create({
    name,
    email,
    phone: phone || "",
    passwordHash: password, // hashed by pre-save hook
    emailVerificationToken: verificationToken,
    emailVerificationExpiry: verificationExpiry,
  });

  // Send verification email (non-blocking)
  sendVerificationEmail(user, verificationToken).catch((e) =>
    console.error("[Auth] Verification email failed:", e.message)
  );

  const accessToken = generateAccessToken({ id: user._id, role: user.role });
  const refreshToken = generateRefreshToken({ id: user._id, role: user.role });

  // Store refresh token
  await User.findByIdAndUpdate(user._id, {
    $push: { refreshTokens: refreshToken },
  });

  res.cookie("refreshToken", refreshToken, COOKIE_OPTS);

  return sendSuccess(res, 201, "Account created successfully", {
    accessToken,
    user,
  });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+passwordHash +refreshTokens");
  if (!user) return sendError(res, 401, "Invalid email or password");
  if (!user.isActive) return sendError(res, 403, "Your account has been deactivated");

  const isMatch = await user.comparePassword(password);
  if (!isMatch) return sendError(res, 401, "Invalid email or password");

  const accessToken = generateAccessToken({ id: user._id, role: user.role });
  const refreshToken = generateRefreshToken({ id: user._id, role: user.role });

  // Keep at most 5 refresh tokens (multi-device)
  const tokens = [...(user.refreshTokens || []), refreshToken].slice(-5);
  await User.findByIdAndUpdate(user._id, { refreshTokens: tokens });

  res.cookie("refreshToken", refreshToken, COOKIE_OPTS);

  const safeUser = user.toJSON();
  return sendSuccess(res, 200, "Logged in successfully", { accessToken, user: safeUser });
});

// POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (token && req.user) {
    // Remove only this device's refresh token
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { refreshTokens: token },
    });
  }

  res.clearCookie("refreshToken", COOKIE_OPTS);
  return sendSuccess(res, 200, "Logged out successfully");
});

// POST /api/auth/refresh
const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) return sendError(res, 401, "No refresh token");

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    return sendError(res, 401, "Invalid or expired refresh token");
  }

  const user = await User.findById(decoded.id).select("+refreshTokens");
  if (!user || !user.isActive) return sendError(res, 401, "Account not found");

  if (!user.refreshTokens.includes(token)) {
    // Token reuse detected — revoke all
    await User.findByIdAndUpdate(user._id, { refreshTokens: [] });
    res.clearCookie("refreshToken", COOKIE_OPTS);
    return sendError(res, 401, "Token reuse detected. Please log in again.");
  }

  // Rotate refresh token
  const newRefreshToken = generateRefreshToken({ id: user._id, role: user.role });
  const newAccessToken = generateAccessToken({ id: user._id, role: user.role });

  const updatedTokens = user.refreshTokens
    .filter((t) => t !== token)
    .concat(newRefreshToken)
    .slice(-5);

  await User.findByIdAndUpdate(user._id, { refreshTokens: updatedTokens });
  res.cookie("refreshToken", newRefreshToken, COOKIE_OPTS);

  return sendSuccess(res, 200, "Token refreshed", { accessToken: newAccessToken });
});

// POST /api/auth/verify-email
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;
  if (!token) return sendError(res, 400, "Verification token is required");

  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpiry: { $gt: Date.now() },
  }).select("+emailVerificationToken +emailVerificationExpiry");

  if (!user) return sendError(res, 400, "Invalid or expired verification link");

  user.isVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpiry = undefined;
  await user.save();

  return sendSuccess(res, 200, "Email verified successfully");
});

// POST /api/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  // Always return 200 to prevent user enumeration
  if (!user) {
    return sendSuccess(res, 200, "If that email is registered, a reset link has been sent");
  }

  const token = generateSecureToken();
  user.passwordResetToken = crypto.createHash("sha256").update(token).digest("hex");
  user.passwordResetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1h
  await user.save({ validateBeforeSave: false });

  sendPasswordResetEmail(user, token).catch((e) =>
    console.error("[Auth] Reset email failed:", e.message)
  );

  return sendSuccess(res, 200, "If that email is registered, a reset link has been sent");
});

// POST /api/auth/reset-password
const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  const hashed = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashed,
    passwordResetExpiry: { $gt: Date.now() },
  }).select("+passwordResetToken +passwordResetExpiry +refreshTokens");

  if (!user) return sendError(res, 400, "Invalid or expired reset link");

  user.passwordHash = password; // will be re-hashed by pre-save hook
  user.passwordResetToken = undefined;
  user.passwordResetExpiry = undefined;
  user.refreshTokens = []; // revoke all existing sessions
  await user.save();

  res.clearCookie("refreshToken", COOKIE_OPTS);
  return sendSuccess(res, 200, "Password reset successfully. Please log in again.");
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return sendError(res, 404, "User not found");
  return sendSuccess(res, 200, "User fetched", { user });
});

module.exports = {
  register,
  login,
  logout,
  refresh,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getMe,
};
