
/**
 * Centralised error handler — must be registered as the LAST middleware.
 * Never exposes stack traces or internal details in production.
 */
const errorHandler = (err, req, res, next) => {
  const isDev = process.env.NODE_ENV !== "production";

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: messages[0], errors: messages });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    const value = err.keyValue ? err.keyValue[field] : "";
    return res.status(409).json({
      success: false,
      message: `${field} '${value}' is already in use`,
    });
  }

  // Mongoose cast error (bad ObjectId)
  if (err.name === "CastError") {
    return res.status(400).json({ success: false, message: "Invalid ID format" });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }

  console.error("[ErrorHandler]", err.message, isDev ? err.stack : "");

  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(isDev && { stack: err.stack }),
  });
};

module.exports = errorHandler;
