
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, sendError } = require("../utils/apiResponse");

// GET /api/users/profile
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return sendError(res, 404, "User not found");
  return sendSuccess(res, 200, "Profile fetched", { user });
});

// PUT /api/users/profile
const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = ["name", "phone"];
  const updates = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  if (req.body.phone && !/^[0-9]{10}$/.test(req.body.phone)) {
    return sendError(res, 400, "Phone must be 10 digits");
  }

  const user = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true,
    runValidators: true,
  });
  return sendSuccess(res, 200, "Profile updated", { user });
});

// PUT /api/users/change-password
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select("+passwordHash");
  if (!user) return sendError(res, 404, "User not found");

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) return sendError(res, 400, "Current password is incorrect");

  user.passwordHash = newPassword;
  await user.save();

  return sendSuccess(res, 200, "Password changed successfully");
});

// GET /api/users/addresses
const getAddresses = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("addresses");
  return sendSuccess(res, 200, "Addresses fetched", { addresses: user.addresses });
});

// POST /api/users/addresses
const addAddress = asyncHandler(async (req, res) => {
  const { label, line1, line2, city, state, pincode, isDefault } = req.body;

  if (!line1 || !city) return sendError(res, 400, "Line 1 and city are required");

  const user = await User.findById(req.user.id);

  if (isDefault) {
    user.addresses.forEach((a) => (a.isDefault = false));
  }

  user.addresses.push({ label: label || "Home", line1, line2: line2 || "", city, state: state || "", pincode: pincode || "", isDefault: !!isDefault });
  await user.save();

  return sendSuccess(res, 201, "Address added", { addresses: user.addresses });
});

// PUT /api/users/addresses/:id
const updateAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  const address = user.addresses.id(req.params.id);
  if (!address) return sendError(res, 404, "Address not found");

  const fields = ["label", "line1", "line2", "city", "state", "pincode", "isDefault"];
  for (const f of fields) {
    if (req.body[f] !== undefined) address[f] = req.body[f];
  }

  if (req.body.isDefault) {
    user.addresses.forEach((a) => {
      if (a._id.toString() !== req.params.id) a.isDefault = false;
    });
  }

  await user.save();
  return sendSuccess(res, 200, "Address updated", { addresses: user.addresses });
});

// DELETE /api/users/addresses/:id
const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  user.addresses = user.addresses.filter(
    (a) => a._id.toString() !== req.params.id
  );
  await user.save();
  return sendSuccess(res, 200, "Address removed", { addresses: user.addresses });
});

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
};
