const Payments = require("../models/payments");
const User = require("../models/user");
const MembershipPlan = require("../models/gymMembershipPlan");

/**
 * @swagger
 * components:
 *   schemas:
 *     Payments:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique identifier for the payment
 *         gym_member_id:
 *           type: integer
 *           description: Unique identifier for the gym member
 *         membership_plan_id:
 *           type: integer
 *           description: Unique identifier for the membership plan
 *         start_date:
 *           type: string
 *           format: date
 *           description: Start date of the payment
 *         end_date:
 *           type: string
 *           format: date
 *           description: End date of the payment
 *         payment_date:
 *           type: string
 *           format: date
 *           description: Date the payment was made
 *         payment_type:
 *           type: string
 *           enum: ["calculated_fee", "discounted_fee", "topup"]
 *           description: Type of payment
 *         payment_method:
 *           type: string
 *           description: Method of payment (e.g., credit card, cash)
 *         calculation_breakup:
 *           type: string
 *           description: Detailed breakdown of the payment calculation
 *         total_amount:
 *           type: number
 *           format: decimal
 *           description: Total amount of the payment
 *         comments:
 *           type: string
 *           description: Additional comments about the payment
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp of when the payment was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp of when the payment was last updated
 */

/**
 * @swagger
 * /api/payments/{paymentId}:
 *   get:
 *     summary: Get payment by ID
 *     tags: [Payments]
 *     description: Retrieve details of a payment by its ID.
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         description: Numeric ID of the payment to fetch.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A payment object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Payments'
 *       401:
 *         description: Unauthorized. Only authorized users can fetch payment details.
 *       404:
 *         description: Payment not found
 *       500:
 *         description: Internal server error
 */
exports.getPaymentById = async (req, res) => {
  const paymentId = req.params.paymentId;

  try {
    const payment = await Payments.findByPk(paymentId, {
      include: [
        { model: User, attributes: ["id", "username", "email"] },
        { model: MembershipPlan, attributes: ["id", "plan_name"] },
      ],
    });

    if (!payment) {
      return res.status(404).send("Payment not found.");
    }

    res.status(200).json(payment);
  } catch (error) {
    console.error("Error fetching payment by ID:", error);
    res.status(500).send("Internal server error.");
  }
};

/**
 * @swagger
 * /api/payments:
 *   get:
 *     summary: Get all payments with pagination, sorting, and filtering
 *     tags: [Payments]
 *     description: Retrieve a list of all payments with pagination, sorting, and filtering.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Sorting field and order (e.g., "start_date,asc")
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *         description: Filter criteria
 *     responses:
 *       200:
 *         description: A list of payments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Payments'
 *       401:
 *         description: Unauthorized. Only authorized users can fetch payments.
 *       500:
 *         description: Internal server error
 */
exports.getAllPayments = async (req, res) => {
  const { page = 1, size = 10, sort = "start_date,asc", filter } = req.query;

  try {
    const offset = (page - 1) * size;
    const order = sort.split(",").map((s) => s.trim());
    const where = filter ? JSON.parse(filter) : {};

    const { count, rows } = await Payments.findAndCountAll({
      where,
      limit: parseInt(size),
      offset: parseInt(offset),
      order: [order],
      include: [
        { model: User, attributes: ["id", "username", "email"] },
        { model: MembershipPlan, attributes: ["id", "plan_name"] },
      ],
    });

    res.status(200).json({
      totalItems: count,
      totalPages: Math.ceil(count / size),
      currentPage: page,
      payments: rows,
    });
  } catch (error) {
    console.error("Error fetching all payments:", error);
    res.status(500).send("Internal server error.");
  }
};

/**
 * @swagger
 * /api/payments:
 *   post:
 *     summary: Create a new payment
 *     tags: [Payments]
 *     description: Create a new payment. Only admin and gym_admin can create a payment.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Payments'
 *     responses:
 *       201:
 *         description: Payment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Payments'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized. Only admin and gym_admin can create payments.
 *       500:
 *         description: Internal server error
 */
exports.createPayment = async (req, res) => {
  const {
    gym_member_id,
    membership_plan_id,
    start_date,
    end_date,
    payment_date,
    payment_type,
    payment_method,
    calculation_breakup,
    total_amount,
    comments,
  } = req.body;

  try {
    const newPayment = await Payments.create({
      gym_member_id,
      membership_plan_id,
      start_date,
      end_date,
      payment_date,
      payment_type,
      payment_method,
      calculation_breakup,
      total_amount,
      comments,
    });

    res.status(201).json(newPayment);
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(500).send("Internal server error.");
  }
};

/**
 * @swagger
 * /api/payments/{paymentId}:
 *   put:
 *     summary: Update a payment by ID
 *     tags: [Payments]
 *     description: Update details of a payment by its ID. Only admin and gym_admin can update a payment.
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         description: Numeric ID of the payment to update.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Payments'
 *     responses:
 *       200:
 *         description: Payment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Payments'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized. Only admin and gym_admin can update payments.
 *       404:
 *         description: Payment not found
 *       500:
 *         description: Internal server error
 */
exports.updatePaymentById = async (req, res) => {
  const paymentId = req.params.paymentId;
  const {
    gym_member_id,
    membership_plan_id,
    start_date,
    end_date,
    payment_date,
    payment_type,
    payment_method,
    calculation_breakup,
    total_amount,
    comments,
  } = req.body;

  try {
    const paymentToUpdate = await Payments.findByPk(paymentId);

    if (!paymentToUpdate) {
      return res.status(404).send("Payment not found.");
    }

    if (gym_member_id !== undefined)
      paymentToUpdate.gym_member_id = gym_member_id;
    if (membership_plan_id !== undefined)
      paymentToUpdate.membership_plan_id = membership_plan_id;
    if (start_date !== undefined) paymentToUpdate.start_date = start_date;
    if (end_date !== undefined) paymentToUpdate.end_date = end_date;
    if (payment_date !== undefined) paymentToUpdate.payment_date = payment_date;
    if (payment_type !== undefined) paymentToUpdate.payment_type = payment_type;
    if (payment_method !== undefined)
      paymentToUpdate.payment_method = payment_method;
    if (calculation_breakup !== undefined)
      paymentToUpdate.calculation_breakup = calculation_breakup;
    if (total_amount !== undefined) paymentToUpdate.total_amount = total_amount;
    if (comments !== undefined) paymentToUpdate.comments = comments;

    await paymentToUpdate.save();
    res.status(200).json(paymentToUpdate);
  } catch (error) {
    console.error("Error updating payment:", error);
    res.status(500).send("Internal server error.");
  }
};

/**
 * @swagger
 * /api/payments/{paymentId}:
 *   delete:
 *     summary: Delete a payment by ID
 *     tags: [Payments]
 *     description: Delete a payment by its ID. Only admin and gym_admin can delete a payment.
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         description: Numeric ID of the payment to delete.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Payment deleted successfully
 *       401:
 *         description: Unauthorized. Only admin and gym_admin can delete payments.
 *       404:
 *         description: Payment not found
 *       500:
 *         description: Internal server error
 */
exports.deletePaymentById = async (req, res) => {
  const paymentId = req.params.paymentId;

  try {
    const paymentToDelete = await Payments.findByPk(paymentId);

    if (!paymentToDelete) {
      return res.status(404).send("Payment not found.");
    }

    await paymentToDelete.destroy();
    res.status(200).send("Payment deleted successfully.");
  } catch (error) {
    console.error("Error deleting payment:", error);
    res.status(500).send("Internal server error.");
  }
};