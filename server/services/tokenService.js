
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

const generateAccessToken = (payload) => {
  if (!ACCESS_SECRET) throw new Error("JWT_ACCESS_SECRET is not set");
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: "15m" });
};

const generateRefreshToken = (payload) => {
  if (!REFRESH_SECRET) throw new Error("JWT_REFRESH_SECRET is not set");
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: "7d" });
};

const verifyAccessToken = (token) => {
  if (!ACCESS_SECRET) throw new Error("JWT_ACCESS_SECRET is not set");
  return jwt.verify(token, ACCESS_SECRET);
};

const verifyRefreshToken = (token) => {
  if (!REFRESH_SECRET) throw new Error("JWT_REFRESH_SECRET is not set");
  return jwt.verify(token, REFRESH_SECRET);
};

const generateSecureToken = () => crypto.randomBytes(32).toString("hex");

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateSecureToken,
};
