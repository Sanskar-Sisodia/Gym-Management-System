const { Op } = require("sequelize");
const MembershipPlansPrice = require("../models/membershipPlansPrice");
const MembershipPlan = require("../models/gymMembershipPlan");
const logger = require("../utils/logger");

/**
 * @swagger
 * components:
 *   schemas:
 *     MembershipPlansPrice:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         membership_plan_id:
 *           type: integer
 *         price:
 *           type: number
 *           format: float
 *         validity_start_date:
 *           type: string
 *           format: date
 *         validity_end_date:
 *           type: string
 *           format: date
 *         comments:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/membershipPlansPrices/{priceId}:
 *   get:
 *     summary: Get membership plan price by ID
 *     tags: [MembershipPlansPrices]
 *     description: Retrieve details of a membership plan price by its ID.
 *     parameters:
 *       - in: path
 *         name: priceId
 *         required: true
 *         description: Numeric ID of the membership plan price to fetch.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A membership plan price object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MembershipPlansPrice'
 *       401:
 *         description: Unauthorized. Only admin or authorized users can fetch membership plan price details.
 *       404:
 *         description: Membership plan price not found
 *       500:
 *         description: Internal server error
 */
exports.getMembershipPlanPriceById = async (req, res) => {
  const priceId = req.params.priceId;

  try {
    // Fetch the membership plan price from the database by ID
    const price = await MembershipPlansPrice.findByPk(priceId, {
      include: {
        model: MembershipPlan,
        attributes: ["id", "plan_name", "gym_id"],
      },
    });

    // Check if price exists
    if (!price) {
      return res.status(404).json({ error: "Membership plan price not found" });
    }

    if (req.user.type !== "admin") {
      gym_id = req.user.gym_id;
      membership_plan_ids = await MembershipPlan.findAll({
        where: { gym_id },
        attributes: ["id"],
      }).map((plan) => plan.id);

      const membership_plan_id = price.membership_plan_id;
      // Check if the requested id is in membership_plan_ids
      if (!membership_plan_ids.includes(membership_plan_id)) {
        return res.status(401).json({
          error: "Unauthorized to access this membership plan price",
        });
      }
    }

    // Log success and send the price details in the response
    logger.info(`Retrieved membership plan price with ID ${priceId}`);
    res.status(200).json(price);
  } catch (error) {
    // Log error and handle errors
    logger.error(
      `Error fetching membership plan price by ID: ${error.message}`
    );
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @swagger
 * /api/membershipPlansPrices:
 *   post:
 *     summary: Create a new membership plan price
 *     tags: [MembershipPlansPrices]
 *     description: Create a new membership plan price.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MembershipPlansPrice'
 *     responses:
 *       201:
 *         description: Membership plan price created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MembershipPlansPrice'
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
exports.createMembershipPlanPrice = async (req, res) => {
  const {
    membership_plan_id,
    price,
    validity_start_date,
    validity_end_date,
    comments,
  } = req.body;

  try {
    if (req.user.type !== "admin" && req.user.type !== "gym_admin") {
      return res.status(401).json({
        error: "Unauthorized to create a membership plan price",
      });
    }

    // Validate required fields and date order
    if (
      !membership_plan_id ||
      !price ||
      !validity_start_date ||
      !validity_end_date ||
      new Date(validity_start_date) >= new Date(validity_end_date)
    ) {
      return res
        .status(400)
        .json({ error: "Invalid validity dates or missing fields" });
    }

    // Check for overlapping validity periods for the same membership_plan_id
    const overlappingPrice = await MembershipPlansPrice.findOne({
      where: {
        membership_plan_id,
        [Op.or]: [
          {
            validity_start_date: {
              [Op.lte]: validity_end_date,
            },
            validity_end_date: {
              [Op.gte]: validity_start_date,
            },
          },
        ],
      },
    });

    if (overlappingPrice) {
      return res
        .status(400)
        .json({ error: "Validity period overlaps with an existing price" });
    }

    if (req.user.type !== "admin") {
      gym_id = req.user.gym_id;
      membership_plan_ids = await MembershipPlan.findAll({
        where: { gym_id },
        attributes: ["id"],
      }).map((plan) => plan.id);

      // Check if the requested id is in membership_plan_ids
      if (!membership_plan_ids.includes(membership_plan_id)) {
        return res.status(401).json({
          error: "Unauthorized to create a price for this membership plan",
        });
      }
    }

    // Create the new membership plan price
    const newPrice = await MembershipPlansPrice.create({
      membership_plan_id,
      price,
      validity_start_date,
      validity_end_date,
      comments,
    });

    // Log success and send the created price details in the response
    logger.info(`Created new membership plan price with ID ${newPrice.id}`);
    res.status(201).json(newPrice);
  } catch (error) {
    // Log error and handle errors
    logger.error(`Error creating membership plan price: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @swagger
 * /api/membershipPlansPrices/update/{priceId}:
 *   put:
 *     summary: Update a membership plan price by price ID
 *     tags: [MembershipPlansPrices]
 *     description: Update details of a membership plan price by its ID.
 *     parameters:
 *       - in: path
 *         name: priceId
 *         required: true
 *         description: Numeric ID of the membership plan price to update.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               membership_plan_id:
 *                 type: integer
 *               price:
 *                 type: number
 *               validity_start_date:
 *                 type: string
 *                 format: date
 *               validity_end_date:
 *                 type: string
 *                 format: date
 *               comments:
 *                 type: string
 *     responses:
 *       200:
 *         description: Membership plan price updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MembershipPlansPrice'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized. Only admin or authorized users can update membership plan prices.
 *       404:
 *         description: Membership plan price not found
 *       500:
 *         description: Internal server error
 */
exports.updateMembershipPlanPriceById = async (req, res) => {
  const priceId = req.params.priceId;
  const {
    membership_plan_id,
    price,
    validity_start_date,
    validity_end_date,
    comments,
  } = req.body;

  try {
    if (req.user.type !== "admin" && req.user.type !== "gym_admin") {
      return res.status(401).json({
        error: "Unauthorized to update a membership plan price",
      });
    }

    // Fetch the membership plan price from the database by ID
    let priceToUpdate = await MembershipPlansPrice.findByPk(priceId);

    // Check if price exists
    if (!priceToUpdate) {
      return res.status(404).json({ error: "Membership plan price not found" });
    }

    // Check for date order and overlapping validity periods for the same membership_plan_id
    if (
      validity_start_date !== undefined &&
      validity_end_date !== undefined &&
      new Date(validity_start_date) >= new Date(validity_end_date)
    ) {
      return res.status(400).json({
        error: "Validity start date must be before validity end date",
      });
    }

    if (
      membership_plan_id !== undefined ||
      validity_start_date !== undefined ||
      validity_end_date !== undefined
    ) {
      const overlappingPrice = await MembershipPlansPrice.findOne({
        where: {
          membership_plan_id:
            membership_plan_id || priceToUpdate.membership_plan_id,
          id: {
            [Op.not]: priceId,
          },
          [Op.or]: [
            {
              validity_start_date: {
                [Op.lte]: validity_end_date || priceToUpdate.validity_end_date,
              },
              validity_end_date: {
                [Op.gte]:
                  validity_start_date || priceToUpdate.validity_start_date,
              },
            },
          ],
        },
      });

      if (overlappingPrice) {
        return res
          .status(400)
          .json({ error: "Validity period overlaps with an existing price" });
      }
    }

    // Update the price object with the provided data
    if (membership_plan_id !== undefined) {
      priceToUpdate.membership_plan_id = membership_plan_id;
    }
    if (price !== undefined) {
      priceToUpdate.price = price;
    }
    if (validity_start_date !== undefined) {
      priceToUpdate.validity_start_date = validity_start_date;
    }
    if (validity_end_date !== undefined) {
      priceToUpdate.validity_end_date = validity_end_date;
    }
    if (comments !== undefined) {
      priceToUpdate.comments = comments;
    }

    if (req.user.type !== "admin") {
      gym_id = req.user.gym_id;
      membership_plan_ids = await MembershipPlan.findAll({
        where: { gym_id },
        attributes: ["id"],
      }).map((plan) => plan.id);

      // Check if the requested id is in membership_plan_ids
      if (!membership_plan_ids.includes(membership_plan_id)) {
        return res.status(401).json({
          error: "Unauthorized to update a price for this membership plan",
        });
      }
    }

    // Save the updated price
    priceToUpdate = await priceToUpdate.save();

    // Log success and send the updated price details in the response
    logger.info(`Updated membership plan price with ID ${priceId}`);
    res.status(200).json(priceToUpdate);
  } catch (error) {
    // Log error and handle errors
    logger.error(`Error updating membership plan price: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @swagger
 * /api/membershipPlansPrices/delete/{priceId}:
 *   delete:
 *     summary: Delete a membership plan price by price ID
 *     tags: [MembershipPlansPrices]
 *     description: Delete a membership plan price by its ID.
 *     parameters:
 *       - in: path
 *         name: priceId
 *         required: true
 *         description: Numeric ID of the membership plan price to delete.
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Membership plan price deleted successfully
 *       401:
 *         description: Unauthorized. Only admin or authorized users can delete membership plan prices.
 *       404:
 *         description: Membership plan price not found
 *       500:
 *         description: Internal server error
 */
exports.deleteMembershipPlanPriceById = async (req, res) => {
  const priceId = req.params.priceId;

  try {
    // Fetch the membership plan price from the database by ID
    const priceToDelete = await MembershipPlansPrice.findByPk(priceId);

    const membership_plan_id = priceToDelete.membership_plan_id;

    if (req.user.type !== "admin") {
      gym_id = req.user.gym_id;
      membership_plan_ids = await MembershipPlan.findAll({
        where: { gym_id },
        attributes: ["id"],
      }).map((plan) => plan.id);

      // Check if the requested id is in membership_plan_ids
      if (!membership_plan_ids.includes(membership_plan_id)) {
        return res.status(401).json({
          error: "Unauthorized to delete a price for this membership plan",
        });
      }
    }

    // Check if price exists
    if (!priceToDelete) {
      return res.status(404).json({ error: "Membership plan price not found" });
    }

    // Delete the price from the database
    await priceToDelete.destroy();

    // Log success and send a success response
    logger.info(`Deleted membership plan price with ID ${priceId}`);
    res.sendStatus(204);
  } catch (error) {
    // Log error and handle errors
    logger.error(`Error deleting membership plan price: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @swagger
 * /api/membershipPlansPrices:
 *   get:
 *     summary: Get all membership plan prices
 *     tags: [MembershipPlansPrices]
 *     description: Retrieve a list of all membership plan prices with support for DataTables.
 *     parameters:
 *       - in: query
 *         name: draw
 *         schema:
 *           type: integer
 *           description: Sequence number sent by DataTables
 *       - in: query
 *         name: start
 *         schema:
 *           type: integer
 *           description: Paging first record indicator
 *       - in: query
 *         name: length
 *         schema:
 *           type: integer
 *           description: Number of records that the table can display in the current draw
 *       - in: query
 *         name: order
 *         schema:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               column:
 *                 type: integer
 *                 description: Column to which ordering should be applied (index-based)
 *               dir:
 *                 type: string
 *                 enum: [asc, desc]
 *                 description: Ordering direction for this column
 *       - in: query
 *         name: search
 *         schema:
 *           type: object
 *           properties:
 *             value:
 *               type: string
 *               description: Global search value
 *     responses:
 *       200:
 *         description: An array of membership plan prices
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 draw:
 *                   type: integer
 *                   description: Sequence number sent by DataTables
 *                 recordsTotal:
 *                   type: integer
 *                   description: Total number of membership plan prices without filtering
 *                 recordsFiltered:
 *                   type: integer
 *                   description: Total number of membership plan prices after filtering
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MembershipPlansPrice'
 *       401:
 *         description: Unauthorized. Only admin or authorized users can fetch membership plan prices.
 *       500:
 *         description: Internal server error
 */
exports.getAllMembershipPlanPrices = async (req, res) => {
  const currentUser = req.user;

  // Extract query parameters and provide sensible defaults
  const {
    draw = 1,
    start = 0,
    length = 10,
    order = [{ column: 0, dir: "asc" }],
    search = { value: "" }
  } = req.query;

  const drawNumber = isNaN(parseInt(draw, 10)) ? 1 : parseInt(draw, 10);
  const startIndex = isNaN(parseInt(start, 10)) ? 0 : parseInt(start, 10);
  const limitNumber = isNaN(parseInt(length, 10)) ? 10 : parseInt(length, 10);
  const searchValue = search && search.value ? search.value : "";

  const validColumns = [
    "id",
    "membership_plan_id",
    "price",
    "validity_start_date",
    "validity_end_date",
    "comments",
    "createdAt",
    "updatedAt"
  ];

  const orderBy = order && order.length > 0 ? order[0].column : 0;
  const orderDir = order && order.length > 0 && order[0].dir ? order[0].dir.toLowerCase() : "asc";
  const sanitizedSortBy = validColumns.includes(validColumns[orderBy]) ? validColumns[orderBy] : "id";
  const orderCondition = [[sanitizedSortBy, orderDir]];

  try {
    let whereCondition = {
      [Op.or]: validColumns.map(col => ({
        [col]: { [Op.like]: `%${searchValue}%` }
      }))
    };

    if (currentUser.type !== "admin") {
      gym_id = req.user.gym_id;
      const membershipPlanIds = await MembershipPlan.findAll({
        where: { gym_id },
        attributes: ["id"]
      }).map(plan => plan.id);

      whereCondition = {
        ...whereCondition,
        membership_plan_id: { [Op.in]: membershipPlanIds }
      };
    }

    const { count, rows } = await MembershipPlansPrice.findAndCountAll({
      where: whereCondition,
      include: {
        model: MembershipPlan,
        attributes: ["id", "plan_name", "gym_id"]
      },
      order: orderCondition,
      limit: limitNumber,
      offset: startIndex
    });

    res.status(200).json({
      draw: drawNumber,
      recordsTotal: count,
      recordsFiltered: count,
      data: rows
    });
  } catch (error) {
    logger.error(`Error fetching all membership plan prices: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
};