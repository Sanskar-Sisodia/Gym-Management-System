const { Op } = require("sequelize");
const MembershipPlan = require("../models/gymMembershipPlan");
const logger = require("../utils/logger");

/**
 * @swagger
 * components:
 *   schemas:
 *     MembershipPlan:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         gym_id:
 *           type: integer
 *         plan_name:
 *           type: string
 *         plan_description:
 *           type: string
 *         duration_type:
 *           type: string
 *           enum: [days, months, years]
 *         duration_value:
 *           type: integer
 *         category:
 *           type: string
 */

/**
 * @swagger
 * /api/gymMembershipPlans/{planId}:
 *   get:
 *     summary: Get a membership plan by ID
 *     tags: [MembershipPlans]
 *     description: Retrieve details of a membership plan by its ID.
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         description: Numeric ID of the membership plan to fetch.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A membership plan object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MembershipPlan'
 *       401:
 *         description: Unauthorized. Only admin or gym_admin can fetch membership plan details.
 *       404:
 *         description: Membership plan not found
 *       500:
 *         description: Internal server error
 */
exports.getMembershipPlanById = async (req, res) => {
  const planId = req.params.planId;

  try {
    // Ensure only admin or gym_admin can fetch membership plan details
    if (req.user.type !== "admin" && req.user.type !== "gym_admin") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    let plan;
    if (req.user.type === "gym_admin") {
      gymId = req.user.gym_id;
      plan;
    } else {
      plan = await MembershipPlan.findByPk(planId);
    }

    // Check if plan exists
    if (!plan) {
      return res.status(404).json({ error: "Membership plan not found" });
    }

    // Log success and send the plan details in the response
    logger.info(`Retrieved membership plan with ID ${planId}`);
    res.status(200).json(plan);
  } catch (error) {
    // Log error and handle errors
    logger.error(`Error fetching membership plan by ID: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @swagger
 * /api/gymMembershipPlans:
 *   post:
 *     summary: Create a new membership plan
 *     tags: [MembershipPlans]
 *     description: Create a new membership plan.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MembershipPlan'
 *     responses:
 *       201:
 *         description: Membership plan created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MembershipPlan'
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
exports.createGymMembershipPlan = async (req, res) => {
  const {
    gym_id,
    plan_name,
    plan_description,
    duration_type,
    duration_value,
    category,
  } = req.body;

  try {
    // Ensure only admin or gym_admin can create membership plans
    if (req.user.type !== "admin" && req.user.type !== "gym_admin") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Ensure that gym_admin could only create membership plans for their gym
    if (req.user.type === "gym_admin" && req.user.gym_id !== gym_id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Validate required fields
    if (
      !gym_id ||
      !plan_name ||
      !duration_type ||
      !duration_value ||
      !category
    ) {
      return res
        .status(400)
        .json({ error: "All required fields must be provided" });
    }

    // Create the new membership plan
    const newPlan = await MembershipPlan.create({
      gym_id,
      plan_name,
      plan_description,
      duration_type,
      duration_value,
      category,
    });

    // Log success and send the created plan details in the response
    logger.info(`Created new membership plan with ID ${newPlan.id}`);
    res.status(201).json(newPlan);
  } catch (error) {
    // Log error and handle errors
    logger.error(`Error creating membership plan: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @swagger
 * /api/gymMembershipPlans/allByGym/{gymId}:
 *   get:
 *     summary: Get all membership plans of a gym
 *     tags: [MembershipPlans]
 *     description: Retrieve all membership plans of a gym by gym ID.
 *     parameters:
 *       - in: path
 *         name: gymId
 *         required: true
 *         description: Numeric ID of the gym to fetch membership plans.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: An array of membership plan objects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MembershipPlan'
 *       404:
 *         description: Gym not found
 *       500:
 *         description: Internal server error
 */

exports.getMembershipPlansByGymId = async (req, res) => {
  const gymId = req.params.gymId;

  // if user is gym_admin or gym_member, they can only fetch their gym's plans
  if (req.user.type === "gym_admin" || req.user.type === "gym_member") {
    if (req.user.gym_id !== gymId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  }

  try {
    // Fetch all membership plans of a gym from the database
    const plans = await MembershipPlan.findAll({
      where: {
        gym_id: gymId,
      },
    });

    // Check if gym exists
    if (!plans.length) {
      return res.status(404).json({ error: "Gym not found" });
    }

    // Log success and send the plans details in the response
    logger.info(
      `Retrieved ${plans.length} membership plans for gym ID ${gymId}`
    );
    res.status(200).json(plans);
  } catch (error) {
    // Log error and handle errors
    logger.error(`Error fetching membership plans by gym ID: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @swagger
 * /api/gymMembershipPlans/update/{planId}:
 *   put:
 *     summary: Update a membership plan by plan ID
 *     tags: [MembershipPlans]
 *     description: Update details of a membership plan by its ID.
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         description: Numeric ID of the membership plan to update.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MembershipPlan'
 *     responses:
 *       200:
 *         description: Membership plan updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MembershipPlan'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized. Only admin or gym_admin can update membership plans.
 *       404:
 *         description: Membership plan not found
 *       500:
 *         description: Internal server error
 */

exports.updateMembershipPlanById = async (req, res) => {
  const planId = req.params.planId;
  const {
    gym_id,
    plan_name,
    plan_description,
    duration_type,
    duration_value,
    category,
  } = req.body;

  try {
    // Ensure only admin or gym_admin can update membership plans
    if (req.user.type !== "admin" && req.user.type !== "gym_admin") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const plan = await MembershipPlan.findByPk(planId);

    if (req.user.type === "gym_admin" && req.user.gym_id !== plan.gym_id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Check if plan exists
    if (!plan) {
      return res.status(404).json({ error: "Membership plan not found" });
    }

    // Ensure that gym_admin can only update their own gym's membership plans
    if (req.user.type === "gym_admin" && req.user.gym_id !== plan.gym_id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Update the plan with the provided data
    const updatedData = {
      plan_name,
      plan_description,
      duration_type,
      duration_value,
      category,
    };

    // Update gym_id if provided and the user is admin
    if (gym_id && req.user.type === "admin") {
      updatedData.gym_id = gym_id;
    }

    // Update the plan in the database
    await plan.update(updatedData);

    // Log success and send the updated plan details in the response
    logger.info(`Updated membership plan with ID ${planId}`);
    res.status(200).json(plan);
  } catch (error) {
    // Log error and handle errors
    logger.error(`Error updating membership plan: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @swagger
 * /api/gymMembershipPlans/delete/{planId}:
 *   delete:
 *     summary: Delete a membership plan by plan ID
 *     tags: [MembershipPlans]
 *     description: Delete a membership plan by its ID.
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         description: Numeric ID of the membership plan to delete.
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Membership plan deleted successfully
 *       401:
 *         description: Unauthorized. Only admin or gym_admin can delete membership plans.
 *       404:
 *         description: Membership plan not found
 *       500:
 *         description: Internal server error
 */

exports.deleteMembershipPlanById = async (req, res) => {
  const planId = req.params.planId;

  try {
    // Ensure only admin or gym_admin can delete membership plans
    if (req.user.type !== "admin" && req.user.type !== "gym_admin") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Fetch the membership plan from the database by ID
    const plan = await MembershipPlan.findByPk(planId);

    // Ensure that gym_admin can only delete their own gym's membership plans
    if (req.user.type === "gym_admin" && req.user.gym_id !== plan.gym_id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Check if plan exists
    if (!plan) {
      return res.status(404).json({ error: "Membership plan not found" });
    }

    // Ensure that gym_admin can only delete their own gym's membership plans
    if (req.user.type === "gym_admin" && req.user.gym_id !== plan.gym_id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Delete the plan from the database
    await plan.destroy();

    // Log success and send a success response
    logger.info(`Deleted membership plan with ID ${planId}`);
    res.sendStatus(204);
  } catch (error) {
    // Log error and handle errors
    logger.error(`Error deleting membership plan: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @swagger
 * /api/gymMembershipPlans:
 *   get:
 *     summary: Get all membership plans with DataTables support
 *     tags: [MembershipPlans]
 *     description: Retrieve all membership plans with support for searching and sorting.
 *     parameters:
 *       - in: query
 *         name: draw
 *         description: Sequence number used by DataTables.
 *         schema:
 *           type: integer
 *       - in: query
 *         name: start
 *         description: Paging first record indicator.
 *         schema:
 *           type: integer
 *       - in: query
 *         name: length
 *         description: Number of records that the table can display in the current draw.
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search[value]
 *         description: Global search value to be applied to the table.
 *         schema:
 *           type: string
 *       - in: query
 *         name: order[0][column]
 *         description: Column number (index) to which ordering should be applied.
 *         schema:
 *           type: integer
 *       - in: query
 *         name: order[0][dir]
 *         description: Ordering direction for the specified column (asc/desc).
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: An object with DataTables-compatible data structure.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 draw:
 *                   type: integer
 *                 recordsTotal:
 *                   type: integer
 *                 recordsFiltered:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MembershipPlan'
 *       500:
 *         description: Internal server error
 */
exports.getAllMembershipPlans = async (req, res) => {
  const { draw, start, length, search, order } = req.query;

  try {
    // Access control: Only admin or gym_admin can fetch all membership plans
    if (req.user.type !== "admin" && req.user.type !== "gym_admin") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Parse start and length parameters to integers with fallbacks
    const pageNumber = isNaN(parseInt(start, 10)) ? 1 : parseInt(start, 10);
    const pageSize = isNaN(parseInt(length, 10)) ? 10 : parseInt(length, 10);

    // Building options for query
    const options = {
      offset: (pageNumber - 1) * pageSize,
      limit: pageSize,
      order: []
    };

    // Apply searching if a search query is provided
    if (search && search.value) {
      options.where = {
        [Op.or]: [
          { plan_name: { [Op.iLike]: `%${search.value}%` } },
          { plan_description: { [Op.iLike]: `%${search.value}%` } },
          { duration_type: { [Op.iLike]: `%${search.value}%` } },
          { category: { [Op.iLike]: `%${search.value}%` } }
        ]
      };
    }

    // Apply sorting if ordering parameters are provided
    if (order && order.length > 0) {
      const columnIndex = parseInt(order[0].column, 10);
      const dir = order[0].dir === "desc" ? "DESC" : "ASC";

      switch (columnIndex) {
        case 0:
          options.order.push(["id", dir]);
          break;
        case 1:
          options.order.push(["gym_id", dir]);
          break;
        case 2:
          options.order.push(["plan_name", dir]);
          break;
        case 3:
          options.order.push(["plan_description", dir]);
          break;
        case 4:
          options.order.push(["duration_type", dir]);
          break;
        case 5:
          options.order.push(["duration_value", dir]);
          break;
        case 6:
          options.order.push(["category", dir]);
          break;
        default:
          break;
      }
    }

    // Fetch total records count (for pagination)
    const recordsTotal = await MembershipPlan.count();

    // for gym_admin and gym_member, fetch plans of their gym only
    if (req.user.type === "gym_admin" || req.user.type === "gym_member") {
      options.where = { gym_id: req.user.gym_id };
    }

    // Fetch filtered records count (for search)
    let recordsFiltered = recordsTotal;
    if (options.where) {
      options.attributes = ["id"];
      recordsFiltered = await MembershipPlan.count(options);
      options.attributes = undefined; // Reset attributes for actual data fetch
    }

    // Fetch membership plans
    const plans = await MembershipPlan.findAll(options);

    // Respond with DataTables-compatible structure
    res.status(200).json({
      draw: parseInt(draw, 10),
      recordsTotal,
      recordsFiltered,
      data: plans
    });

  } catch (error) {
    // Log error and handle errors
    logger.error(`Error fetching all membership plans: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
};