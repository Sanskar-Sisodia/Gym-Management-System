const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const membershipPlansPriceController = require("../controllers/membershipPlansPriceController");

// POST /api/membershipPlansPrices
router.post(
  "/",
  authMiddleware,
  membershipPlansPriceController.createMembershipPlanPrice
);

// GET /api/membershipPlansPrices
router.get(
  "/",
  authMiddleware,
  membershipPlansPriceController.getAllMembershipPlanPrices
);

// GET /api/membershipPlansPrices/:priceId
router.get(
  "/:priceId",
  authMiddleware,
  membershipPlansPriceController.getMembershipPlanPriceById
);

// PUT /api/membershipPlansPrices/update/:priceId
router.put(
  "/update/:priceId",
  authMiddleware,
  membershipPlansPriceController.updateMembershipPlanPriceById
);

// DELETE /api/membershipPlansPrices/delete/:priceId
router.delete(
  "/delete/:priceId",
  authMiddleware,
  membershipPlansPriceController.deleteMembershipPlanPriceById
);

module.exports = router;
