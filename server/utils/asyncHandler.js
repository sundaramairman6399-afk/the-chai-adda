
/**
 * Wraps an async controller so Express catches any
 * unhandled promise rejection without try/catch boilerplate.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
