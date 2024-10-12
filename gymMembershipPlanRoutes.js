const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  createGymMembershipPlan,
  getMembershipPlanById,
  getMembershipPlansByGymId,
  updateMembershipPlanById,
  deleteMembershipPlanById,
  getAllMembershipPlans,
} = require("../controllers/gymMembershipPlanController");

router.post("/", authMiddleware, createGymMembershipPlan);
router.get("/", authMiddleware, getAllMembershipPlans);
router.get("/:planId", authMiddleware, getMembershipPlanById);
router.get("/allByGym/:gymId", authMiddleware, getMembershipPlansByGymId);
router.put("/update/:planId", authMiddleware, updateMembershipPlanById);
router.delete("/delete/:planId", authMiddleware, deleteMembershipPlanById);

module.exports = router;