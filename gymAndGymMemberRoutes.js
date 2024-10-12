const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const gymAndGymMemberController = require("../controllers/gymAndGymMemberController");

// Route to create a new GymAndGymMember record
router.post(
  "/",
  authMiddleware,
  gymAndGymMemberController.createGymAndGymMember
);

// Route to delete a GymAndGymMember record
router.delete(
  "/:id",
  authMiddleware,
  gymAndGymMemberController.deleteGymAndGymMember
);

// Route to get all GymAndGymMember records
router.get(
  "/",
  authMiddleware,
  gymAndGymMemberController.getAllGymAndGymMembers
);

// Route to get members of a gym by gymId
router.get(
  "/members/:gymId",
  authMiddleware,
  gymAndGymMemberController.getMembersOfGym
);

// Route to get gyms of a member by memberId
router.get(
  "/gyms/:memberId",
  authMiddleware,
  gymAndGymMemberController.getGymsOfMember
);

module.exports = router;