const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const membersMembershipController = require("../controllers/membersMembershipController");

// POST /api/membersMemberships
router.post(
  "/",
  authMiddleware,
  membersMembershipController.createMembersMembership
);

// GET /api/membersMemberships
router.get(
  "/",
  authMiddleware,
  membersMembershipController.getAllMembersMemberships
);

// GET /api/membersMemberships/:membershipId
router.get(
  "/:membershipId",
  authMiddleware,
  membersMembershipController.getMembersMembershipById
);

// PUT /api/membersMemberships/update/:membershipId
router.put(
  "/update/:membershipId",
  authMiddleware,
  membersMembershipController.updateMembersMembershipById
);

// DELETE /api/membersMemberships/delete/:membershipId
router.delete(
  "/delete/:membershipId",
  authMiddleware,
  membersMembershipController.deleteMembersMembershipById
);

module.exports = router;