
/**
 * Generates a unique, human-readable order number.
 * Format: TCA-YYYYMMDD-XXXXX (5 random alphanumeric chars)
 */
const generateOrderNumber = () => {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `TCA-${date}-${random}`;
};

module.exports = generateOrderNumber;
