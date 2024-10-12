const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

// Sign up a new admin user
router.post("/signup/admin", authController.signupAdmin);

// Sign up a new gym admin user
router.post("/signup/gymadmin", authMiddleware, authController.signupGymAdmin);

// Sign up a new gym member user
router.post("/signup/gymmember", authController.signupGymMember);

// Log in an existing user
router.post("/login", authController.login);

// To get logged in user details
router.post("/userDetails", authMiddleware, authController.userDetails);

// To delete all
router.delete("/deleteAll", authMiddleware, authController.deleteAll);

module.exports = router;
