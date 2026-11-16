
const express = require("express");
const router = express.Router();

const {
  getProfile, updateProfile, changePassword,
  getAddresses, addAddress, updateAddress, deleteAddress,
} = require("../controllers/userController");

const { authenticate } = require("../middleware/auth");
const validate = require("../middleware/validate");
const authValidators = require("../validators/authValidator");

router.use(authenticate);

router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.put("/change-password", authValidators.changePassword, validate, changePassword);
router.get("/addresses", getAddresses);
router.post("/addresses", addAddress);
router.put("/addresses/:id", updateAddress);
router.delete("/addresses/:id", deleteAddress);

module.exports = router;
