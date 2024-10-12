const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const paymentsController = require("../controllers/paymentsController");

// Route to get a payment by ID
router.get("/:paymentId", authMiddleware, paymentsController.getPaymentById);

// Route to get all payments (with support for searching, sorting, and pagination)
router.get("/", authMiddleware, paymentsController.getAllPayments);

// Route to create a new payment
router.post("/", authMiddleware, paymentsController.createPayment);

// Route to update an existing payment
router.put("/:paymentId", authMiddleware, paymentsController.updatePaymentById);

// Route to delete a payment
router.delete(
  "/:paymentId",
  authMiddleware,
  paymentsController.deletePaymentById
);

module.exports = router;