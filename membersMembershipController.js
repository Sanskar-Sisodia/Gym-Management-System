const { Op } = require("sequelize");
const MembersMembership = require("../models/membersMembership");
const User = require("../models/user");
const MembershipPlan = require("../models/gymMembershipPlan");
const logger = require("../utils/logger");
const GymAndGymMember = require("../models/gymAndGymMember");

/**
 * @swagger
 * components:
 *   schemas:
 *     MembersMembership:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         gym_member_id:
 *           type: integer
 *         membership_plan_id:
 *           type: integer
 *         start_date:
 *           type: string
 *           format: date
 *         end_date:
 *           type: string
 *           format: date
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/membersMemberships:
 *   post:
 *     summary: Create a new membership for a gym member
 *     tags: [MembersMemberships]
 *     description: Create a new membership for a gym member.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MembersMembership'
 *     responses:
 *       201:
 *         description: Membership created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MembersMembership'
 *       400:
 *         description: Bad request. Validation errors or overlapping dates.
 *       500:
 *         description: Internal server error
 */
exports.createMembersMembership = async (req, res) => {
  const { gym_member_id, membership_plan_id, start_date, end_date } = req.body;

  try {
    // only admin or gym_admin can create membership
    if (req.user.type !== "admin" && req.user.type !== "gym_admin") {
      return res.status(401).json({ error: "Unauthorized." });
    }

    // if user is gym_admin, check if the gym_member_id belongs to the gym
    if (req.user.type === "gym_admin") {
      const gymId = await GymAndGymMember.findOne({
        where: {
          memberId: gym_member_id,
        },
      }).then((result) => {
        return result.gymId;
      });

      if (gymId !== req.user.gym_id) {
        return res.status(401).json({ error: "Unauthorized." });
      }

      // check if the membership plan belongs to the gym
      const membershipPlanGymId = await MembershipPlan.findByPk(
        membership_plan_id
      ).then((result) => {
        return result.gymId;
      });

      if (membershipPlanGymId !== req.user.gym_id) {
        return res.status(401).json({ error: "Unauthorized." });
      }
    }

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    console.log("AA", gym_member_id, membership_plan_id, startDate, endDate);

    // Validate required fields and date order
    if (
      !gym_member_id ||
      !membership_plan_id ||
      isNaN(startDate) ||
      isNaN(endDate)
    ) {
      logger.error("Invalid or missing fields.");
      return res.status(400).json({ error: "Invalid or missing fields." });
    }

    if (startDate >= endDate) {
      logger.error("Start date must be before end date.");
      return res
        .status(400)
        .json({ error: "Start date must be before end date." });
    }

    // Check for overlapping memberships
    const overlaps = await MembersMembership.findOne({
      where: {
        gym_member_id,
        start_date: { [Op.lt]: end_date },
        end_date: { [Op.gt]: start_date },
      },
    });

    if (overlaps) {
      logger.error("Membership period overlaps with an existing membership.");
      return res.status(400).json({
        error: "Membership period overlaps with an existing membership.",
      });
    }

    // Create the new members membership
    const newMembership = await MembersMembership.create({
      gym_member_id,
      membership_plan_id,
      start_date,
      end_date,
    });

    // Log success and send the created membership details in the response
    logger.info(`Created new membership with ID ${newMembership.id}`);
    res.status(201).json(newMembership);
  } catch (error) {
    // Log error and handle errors
    logger.error(`Error creating members membership: ${error.message}`);
    res.status(500).json({ error: "Internal server error." });
  }
};

/**
 * @swagger
 * /api/membersMemberships/{membershipId}:
 *   get:
 *     summary: Get membership details by ID
 *     tags: [MembersMemberships]
 *     description: Retrieve details of a membership by its ID.
 *     parameters:
 *       - in: path
 *         name: membershipId
 *         required: true
 *         description: Numeric ID of the membership to fetch.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A membership object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MembersMembership'
 *       401:
 *         description: Unauthorized. Only admin or authorized users can fetch membership details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized.
 *       404:
 *         description: Membership not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Membership not found.
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error.
 */
exports.getMembersMembershipById = async (req, res) => {
  const membershipId = req.params.membershipId;

  try {
    // Fetch the membership from the database by ID, including related models
    const membership = await MembersMembership.findByPk(membershipId, {
      include: [
        {
          model: User,
          attributes: ["id", "username", "email", "firstName", "lastName"],
        },
        {
          model: MembershipPlan,
          attributes: ["id", "plan_name", "plan_description", "category"],
        },
      ],
    });

    // Check if membership exists
    if (!membership) {
      return res.status(404).json({ error: "Membership not found." });
    }

    // Authorization checks based on user type
    if (req.user.type === "gym_admin") {
      // Check if the gym_admin is authorized to view this membership
      const gymAndGymMember = await GymAndGymMember.findOne({
        where: { memberId: membership.gym_member_id },
      });

      if (!gymAndGymMember || gymAndGymMember.gymId !== req.user.gym_id) {
        return res.status(401).json({ error: "Unauthorized." });
      }

      // Check if the membership plan belongs to the same gym
      const membershipPlan = await MembershipPlan.findByPk(
        membership.membership_plan_id
      );

      if (!membershipPlan || membershipPlan.gymId !== req.user.gym_id) {
        return res.status(401).json({ error: "Unauthorized." });
      }
    } else if (req.user.type === "gym_member") {
      // Check if the gym_member is authorized to view this membership
      if (membership.gym_member_id !== req.user.id) {
        return res.status(401).json({ error: "Unauthorized." });
      }
    }

    // Send the membership details in the response
    res.status(200).json(membership);
  } catch (error) {
    // Log error and handle errors
    logger.error(`Error fetching membership by ID: ${error.message}`);
    res.status(500).json({ error: "Internal server error." });
  }
};

/**
 * @swagger
 * /api/membersMemberships/update/{membershipId}:
 *   put:
 *     summary: Update membership details by ID
 *     tags: [MembersMemberships]
 *     description: Update details of a membership by its ID.
 *     parameters:
 *       - in: path
 *         name: membershipId
 *         required: true
 *         description: Numeric ID of the membership to update.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               gym_member_id:
 *                 type: integer
 *               membership_plan_id:
 *                 type: integer
 *               start_date:
 *                 type: string
 *                 format: date
 *               end_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Membership updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MembersMembership'
 *       400:
 *         description: Bad request. Validation errors or overlapping dates.
 *       401:
 *         description: Unauthorized. Only admin or authorized users can update membership details.
 *       404:
 *         description: Membership not found
 *       500:
 *         description: Internal server error
 */
exports.updateMembersMembershipById = async (req, res) => {
  const membershipId = req.params.membershipId;
  const { gym_member_id, membership_plan_id, start_date, end_date } = req.body;

  try {
    // Fetch the membership from the database by ID
    let membershipToUpdate = await MembersMembership.findByPk(membershipId);

    // Check if membership exists
    if (!membershipToUpdate) {
      return res.status(404).json({ error: "Membership not found." });
    }

    // Parse dates
    const startDate = start_date ? new Date(start_date) : undefined;
    const endDate = end_date ? new Date(end_date) : undefined;

    // Check for date order
    if (startDate && endDate && startDate >= endDate) {
      return res
        .status(400)
        .json({ error: "Start date must be before end date." });
    }

    // Check for overlapping memberships if dates are provided
    if (startDate || endDate) {
      const overlappingMembership = await MembersMembership.findOne({
        where: {
          gym_member_id:
            gym_member_id !== undefined
              ? gym_member_id
              : membershipToUpdate.gym_member_id,
          start_date: { [Op.lt]: end_date || membershipToUpdate.end_date },
          end_date: { [Op.gt]: start_date || membershipToUpdate.start_date },
          id: { [Op.ne]: membershipId },
        },
      });

      if (overlappingMembership) {
        return res.status(400).json({
          error: "Membership period overlaps with an existing membership.",
        });
      }
    }

    // Update the membership object with the provided data
    if (gym_member_id !== undefined) {
      membershipToUpdate.gym_member_id = gym_member_id;
    }
    if (membership_plan_id !== undefined) {
      membershipToUpdate.membership_plan_id = membership_plan_id;
    }
    if (start_date !== undefined) {
      membershipToUpdate.start_date = startDate;
    }
    if (end_date !== undefined) {
      membershipToUpdate.end_date = endDate;
    }

    // Authorization checks based on user type
    if (req.user.type === "gym_admin") {
      // Check if the gym_admin is authorized to update this membership
      const gymAndGymMember = await GymAndGymMember.findOne({
        where: { memberId: membershipToUpdate.gym_member_id },
      });

      if (!gymAndGymMember || gymAndGymMember.gymId !== req.user.gym_id) {
        return res.status(401).json({ error: "Unauthorized." });
      }

      // Check if the membership plan belongs to the same gym
      const membershipPlan = await MembershipPlan.findByPk(
        membershipToUpdate.membership_plan_id
      );

      if (!membershipPlan || membershipPlan.gymId !== req.user.gym_id) {
        return res.status(401).json({ error: "Unauthorized." });
      }
    } else if (req.user.type === "gym_member") {
      // Check if the gym_member is authorized to update this membership
      if (membershipToUpdate.gym_member_id !== req.user.id) {
        return res.status(401).json({ error: "Unauthorized." });
      }
    }

    // Save the updated membership
    membershipToUpdate = await membershipToUpdate.save();

    // Log success and send the updated membership details in the response
    logger.info(`Updated membership with ID ${membershipId}`);
    res.status(200).json(membershipToUpdate);
  } catch (error) {
    // Log error and handle errors
    logger.error(`Error updating membership: ${error.message}`);
    res.status(500).json({ error: "Internal server error." });
  }
};

/**
 * @swagger
 * /api/membersMemberships/delete/{membershipId}:
 *   delete:
 *     summary: Delete membership by ID
 *     tags: [MembersMemberships]
 *     description: Delete a membership by its ID.
 *     parameters:
 *       - in: path
 *         name: membershipId
 *         required: true
 *         description: Numeric ID of the membership to delete.
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Membership deleted successfully
 *       401:
 *         description: Unauthorized. Only admin or authorized users can delete membership.
 *       404:
 *         description: Membership not found
 *       500:
 *         description: Internal server error
 */
exports.deleteMembersMembershipById = async (req, res) => {
  const membershipId = req.params.membershipId;

  try {
    // Fetch the membership from the database by ID
    const membershipToDelete = await MembersMembership.findByPk(membershipId);

    // Check if membership exists
    if (!membershipToDelete) {
      return res.status(404).json({ error: "Membership not found." });
    }

    // Authorization checks based on user type
    if (req.user.type === "gym_admin") {
      // Check if the gym_admin is authorized to delete this membership
      const gymAndGymMember = await GymAndGymMember.findOne({
        where: { memberId: membershipToDelete.gym_member_id },
      });

      if (!gymAndGymMember || gymAndGymMember.gymId !== req.user.gym_id) {
        return res.status(401).json({ error: "Unauthorized." });
      }

      // Check if the membership plan belongs to the same gym
      const membershipPlan = await MembershipPlan.findByPk(
        membershipToDelete.membership_plan_id
      );

      if (!membershipPlan || membershipPlan.gymId !== req.user.gym_id) {
        return res.status(401).json({ error: "Unauthorized." });
      }
    } else if (req.user.type === "gym_member") {
      // unauthorized
      return res.status(401).json({ error: "Unauthorized." });
    }

    // Delete the membership from the database
    await membershipToDelete.destroy();

    // Log success and send a success response
    logger.info(`Deleted membership with ID ${membershipId}`);
    res.sendStatus(204);
  } catch (error) {
    // Log error and handle errors
    logger.error(`Error deleting membership: ${error.message}`);
    res.status(500).json({ error: "Internal server error." });
  }
};

/**
 * @swagger
 * /api/membersMemberships:
 *   get:
 *     summary: Get all memberships
 *     tags: [MembersMemberships]
 *     description: Retrieve a list of all memberships.
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
 *         name: search
 *         schema:
 *           type: object
 *           properties:
 *             value:
 *               type: string
 *               description: Global search value
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
 *     responses:
 *       200:
 *         description: An array of memberships
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
 *                   description: Total number of memberships without filtering
 *                 recordsFiltered:
 *                   type: integer
 *                   description: Total number of memberships after filtering
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MembersMembership'
 *       401:
 *         description: Unauthorized. Only admin or authorized users can fetch memberships.
 *       500:
 *         description: Internal server error
 */
exports.getAllMembersMemberships = async (req, res) => {
  const currentUser = req.user;

  // Extract query parameters and provide sensible defaults
  const {
    draw = 1,
    start = 0,
    length = 10,
    order = [{ column: 0, dir: "asc" }],
    search = { value: "" },
    ...filters
  } = req.query;

  const drawNumber = isNaN(parseInt(draw, 10)) ? 1 : parseInt(draw, 10);
  const startIndex = isNaN(parseInt(start, 10)) ? 0 : parseInt(start, 10);
  const limitNumber = isNaN(parseInt(length, 10)) ? 10 : parseInt(length, 10);
  const searchValue = search && search.value ? search.value : "";

  const validColumns = [
    "id",
    "gym_member_id",
    "membership_plan_id",
    "start_date",
    "end_date",
    "createdAt",
    "updatedAt"
  ];

  const orderBy = order && order.length > 0 ? order[0].column : 0;
  const orderDir = order && order.length > 0 && order[0].dir ? order[0].dir.toLowerCase() : "asc";
  const sanitizedSortBy = validColumns.includes(validColumns[orderBy]) ? validColumns[orderBy] : "id";
  const orderCondition = [[sanitizedSortBy, orderDir]];

  const filterConditions = Object.entries(filters).reduce((acc, [key, value]) => {
    if (value && validColumns.includes(key)) {
      acc[key] = { [Op.like]: `%${value}%` };
    }
    return acc;
  }, {});

  try {
    let whereCondition = {
      [Op.or]: validColumns.map(col => ({
        [col]: { [Op.like]: `%${searchValue}%` }
      }))
    };

    if (currentUser.type === "gym_admin") {
      // Add additional conditions for gym_admin role
      const gymMembers = await GymAndGymMember.findAll({
        where: {
          gymId: currentUser.gym_id
        },
        attributes: ["memberId"]
      });
      const memberIds = gymMembers.map(member => member.memberId);
      whereCondition = {
        ...whereCondition,
        gym_member_id: { [Op.in]: memberIds }
        // Add more conditions specific to gym_admin as needed
      };
    } else if (currentUser.type === "gym_member") {
      // Add conditions for gym_member role
      whereCondition = {
        ...whereCondition,
        gym_member_id: currentUser.id
        // Add more conditions specific to gym_member as needed
      };
    }

    const { count, rows } = await MembersMembership.findAndCountAll({
      where: {
        ...filterConditions,
        ...whereCondition
      },
      include: [
        {
          model: User,
          attributes: ["id", "username", "email", "firstName", "lastName"]
        },
        {
          model: MembershipPlan,
          attributes: ["id", "plan_name", "plan_description", "category"]
        }
      ],
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
    logger.error("Error fetching memberships:", error);
    res.status(500).json({
      message: "Internal server error"
    });
  }
};