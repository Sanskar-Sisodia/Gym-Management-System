const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const gymAndGymAdminController = require("../controllers/gymAndGymAdminController");

// Route to create a new GymAndGymAdmin record
router.post("/", authMiddleware, gymAndGymAdminController.createGymAndGymAdmin);

// Route to delete a GymAndGymAdmin record
router.delete("/:id", authMiddleware, gymAndGymAdminController.deleteGymAndGymAdmin);

// Route to get all GymAndGymAdmin records
router.get("/", authMiddleware, gymAndGymAdminController.getAllGymAndGymAdmins);

// Route to get gym admins of a gym by gymId
router.get(
  "/gymAdmins/:gymId",
  authMiddleware,
  gymAndGymAdminController.getGymAdminsOfGym
);

// Route to get gyms of a gym admin by gymAdminId
router.get(
  "/gyms/:gymAdminId",
  authMiddleware,
  gymAndGymAdminController.getGymsOfGymAdmin
);

module.exports = router;