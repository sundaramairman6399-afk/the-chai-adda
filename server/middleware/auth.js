
const { verifyAccessToken } = require("../services/tokenService");
const { sendError } = require("../utils/apiResponse");
const User = require("../models/User");

/**
 * authenticate — requires a valid Bearer access token.
 * Attaches req.user = { id, role, email } on success.
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendError(res, 401, "Authentication required");
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token);

    // Confirm the user still exists and is active
    const user = await User.findById(decoded.id).select("_id role email isActive");
    if (!user || !user.isActive) {
      return sendError(res, 401, "Account not found or deactivated");
    }

    req.user = { id: user._id.toString(), role: user.role, email: user.email };
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return sendError(res, 401, "Access token expired");
    }
    return sendError(res, 401, "Invalid access token");
  }
};

/**
 * optionalAuth — same as authenticate but does NOT block unauthenticated requests.
 * Useful for routes that work for both guests and logged-in users.
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.id).select("_id role email isActive");
      if (user && user.isActive) {
        req.user = { id: user._id.toString(), role: user.role, email: user.email };
      }
    }
  } catch (_) {
    // Silently ignore bad tokens for optional auth
  }
  next();
};

/**
 * authorize(...roles) — requires req.user.role to be in the allowed list.
 * Must be used AFTER authenticate.
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return sendError(res, 401, "Authentication required");
    if (!roles.includes(req.user.role)) {
      return sendError(res, 403, "You do not have permission to perform this action");
    }
    next();
  };
};

module.exports = { authenticate, optionalAuth, authorize };
