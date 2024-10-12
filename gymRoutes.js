const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const gymController = require("../controllers/gymController");

// Route to create a new gym
router.post("/", authMiddleware, gymController.createGym);

// Route to get all gyms
router.get("/", authMiddleware, gymController.getAllGyms);

// Route to get a gym by its ID
router.get("/:id", authMiddleware, gymController.getGymById);

// Route to update a gym by its ID
router.put("/:id", authMiddleware, gymController.updateGymById);

// Route to delete a gym by its ID
router.delete("/:id", authMiddleware, gymController.deleteGymById);

module.exports = router;