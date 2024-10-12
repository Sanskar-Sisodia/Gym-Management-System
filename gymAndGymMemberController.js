const { Op } = require("sequelize");
const GymAndGymMember = require("../models/gymAndGymMember");
const Gym = require("../models/gym");
const User = require("../models/user");
const logger = require("../utils/logger");

/**
 * @swagger
 * components:
 *   schemas:
 *     GymAndGymMember:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         gym:
 *           $ref: '#/components/schemas/Gym'
 *         member:
 *           $ref: '#/components/schemas/UserWithoutPassword'
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UserWithoutPassword:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         username:
 *           type: string
 *           description: Username of the gym member
 *         type:
 *           type: string
 *           description: Type of user (e.g., gym_member)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Gym:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *           description: Name of the gym
 */

/**
 * @swagger
 * /api/gymAndGymMember:
 *   post:
 *     summary: Create a relationship between a gym and a gym member
 *     tags: [GymAndGymMembers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               memberId:
 *                 type: integer
 *                 description: ID of the gym member
 *               gymId:
 *                 type: integer
 *                 description: ID of the gym
 *     responses:
 *       200:
 *         description: Relationship created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GymAndGymMember'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 details:
 *                   type: array
 *                   items:
 *                     type: string
 *       401:
 *         description: Unauthorized, only admin user can create the relationship
 *       409:
 *         description: Conflict, gym or gym member is already linked to another entity
 *       500:
 *         description: Internal server error
 */
exports.createGymAndGymMember = async (req, res) => {
  const currentUser = req.user;

  try {
    // Check if the current user is an admin
    if (currentUser.type !== "admin" && currentUser.type !== "gym_admin") {
      return res.status(401).json({
        error:
          "Unauthorized, only admin or gym_admin user can create the relationship",
      });
    }

    const { memberId, gymId } = req.body;

    // if the current user is a gym_admin, check if the gymId matches the gymId of the gym_admin
    if (currentUser.type === "gym_admin" && currentUser.gymId !== gymId) {
      return res.status(401).json({
        error:
          "Unauthorized, you can only create the relationship for your gym",
      });
    }

    // Check for required fields
    if (!memberId || !gymId) {
      return res.status(400).json({
        error: "Validation error",
        details: ["memberId and gymId are required"],
      });
    }

    // Ensure the memberId refers to a user of type gym_member and the gymId exists
    const [member, gym] = await Promise.all([
      User.findOne({
        where: { id: memberId, type: "gym_member" },
        attributes: { exclude: ["password"] }, // Exclude password field
      }),
      Gym.findByPk(gymId),
    ]);

    const errors = [];
    if (!member) {
      errors.push("The memberId must refer to a user of type 'gym_member'");
    }
    if (!gym) {
      errors.push("The gymId must refer to an existing gym");
    }
    if (errors.length > 0) {
      return res.status(400).json({
        error: "Validation error",
        details: errors,
      });
    }

    // Check if gym member is already linked to another gym
    const existingGymForMember = await GymAndGymMember.findOne({
      where: { memberId },
    });
    if (existingGymForMember) {
      return res.status(409).json({
        error: "Conflict",
        details: ["This gym member is already linked to another gym"],
      });
    }

    // Check if gym is already linked to another gym member
    const existingMemberForGym = await GymAndGymMember.findOne({
      where: { gymId },
    });
    if (existingMemberForGym) {
      return res.status(409).json({
        error: "Conflict",
        details: ["This gym is already linked to another gym member"],
      });
    }

    const relationship = await GymAndGymMember.create({ memberId, gymId });

    // Create a response object including gym and member details
    const response = {
      ...relationship.get({ plain: true }),
      gym: gym,
      member: member,
    };

    // Log success and return JSON response
    logger.info(
      `Created gymAndGymMember relationship: ${JSON.stringify(response)}`
    );
    res.status(200).json(response);
  } catch (error) {
    // Log error and return JSON response
    logger.error(
      `Error creating gymAndGymMember relationship: ${error.message}`
    );
    res.status(500).json({
      error: "Internal server error",
      details: [error.message],
    });
  }
};

/**
 * @swagger
 * /api/gymAndGymMember/{id}:
 *   delete:
 *     summary: Delete a GymAndGymMember record
 *     tags: [GymAndGymMembers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the GymAndGymMember record to delete
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: GymAndGymMember record deleted successfully
 *       401:
 *         description: Unauthorized, only admin user can delete the relationship
 *       404:
 *         description: GymAndGymMember record not found
 *       500:
 *         description: Internal server error
 */
exports.deleteGymAndGymMember = async (req, res) => {
  const currentUser = req.user;

  try {
    // Check if the current user is an admin
    if (currentUser.type !== "admin") {
      return res.status(401).json({
        error: "Unauthorized, only admin user can delete the relationship",
      });
    }

    const { id } = req.params;

    // Find the GymAndGymMember record to delete
    const relationship = await GymAndGymMember.findByPk(id);

    // If record not found, return 404
    if (!relationship) {
      return res.status(404).json({
        error: "Not found",
        details: ["GymAndGymMember record not found"],
      });
    }

    // Delete the GymAndGymMember record
    await GymAndGymMember.destroy({ where: { id } });

    // Log success and respond with 204 indicating successful deletion
    logger.info(`Deleted gymAndGymMember relationship with id ${id}`);
    const response = {
      message: "GymAndGymMember record deleted successfully",
    };
    res.status(204).json(response);
  } catch (error) {
    // Log error and return JSON response
    logger.error(
      `Error deleting gymAndGymMember relationship: ${error.message}`
    );
    res.status(500).json({
      error: "Internal server error",
      details: [error.message],
    });
  }
};

/**
 * @swagger
 * /api/gymAndGymMember:
 *   get:
 *     summary: Get all gymAndGymMember relationships
 *     tags: [GymAndGymMembers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: draw
 *         schema:
 *           type: integer
 *       - in: query
 *         name: start
 *         schema:
 *           type: integer
 *       - in: query
 *         name: length
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search[value]
 *         schema:
 *           type: string
 *       - in: query
 *         name: order[0][column]
 *         schema:
 *           type: integer
 *       - in: query
 *         name: order[0][dir]
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: GymAndGymMember relationships retrieved successfully
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
 *                     $ref: '#/components/schemas/GymAndGymMember'
 *       401:
 *         description: Unauthorized, only admin user can fetch the relationships
 *       500:
 *         description: Internal server error
 */
exports.getAllGymAndGymMembers = async (req, res) => {
  const currentUser = req.user;

  try {
    // Check if the current user is an admin
    if (currentUser.type !== "admin") {
      return res.status(401).json({
        error: "Unauthorized, only admin user can fetch the relationships",
      });
    }

    const { draw, start = 0, length = 10, search, order } = req.query;
    const page = parseInt(start) / parseInt(length) + 1;
    const limit = parseInt(length);

    // Define sorting
    const orderColumnIndex = order ? parseInt(order[0].column) : 0;
    const orderDirection = order ? order[0].dir : "asc";
    const orderFields = ["id", "memberId", "gymId"]; // Adjust based on actual fields
    const sortField = orderFields[orderColumnIndex] || "id";

    const searchValue = search ? search.value : "";

    const whereClause = searchValue
      ? {
          [Op.or]: [
            { "$member.username$": { [Op.like]: `%${searchValue}%` } },
            { "$gym.name$": { [Op.like]: `%${searchValue}%` } },
          ],
        }
      : {};

    const relationships = await GymAndGymMember.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "member",
          where: { type: "gym_member" },
          attributes: { exclude: ["password"] },
        },
        {
          model: Gym,
          as: "gym",
        },
      ],
      offset: start,
      limit: limit,
      order: [[sortField, orderDirection.toUpperCase()]],
    });

    // Log success and return JSON response
    logger.info(
      `Retrieved ${relationships.count} gymAndGymMember relationships`
    );
    res.status(200).json({
      draw: parseInt(draw),
      recordsTotal: relationships.count,
      recordsFiltered: relationships.count,
      data: relationships.rows,
    });
  } catch (error) {
    // Log error and return JSON response
    logger.error(
      `Error fetching gymAndGymMember relationships: ${error.message}`
    );
    res.status(500).json({
      error: "Internal server error",
      details: [error.message],
    });
  }
};

/**
 * @swagger
 * /api/gymAndGymMember/members/{gymId}:
 *   get:
 *     summary: Get the members of a gym
 *     tags: [GymAndGymMembers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: gymId
 *         required: true
 *         description: ID of the gym
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Members retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserWithoutPassword'
 *       401:
 *         description: Unauthorized, only admin user can fetch the members
 *       404:
 *         description: Gym not found
 *       500:
 *         description: Internal server error
 */
exports.getMembersOfGym = async (req, res) => {
  const currentUser = req.user;

  try {
    if (currentUser.type !== "admin" && currentUser.type !== "gym_admin") {
      return res.status(401).json({
        error: "Unauthorized, only admin user can fetch the members",
      });
    }

    const { gymId } = req.params;

    if (!gymId) {
      return res.status(400).json({
        error: "Validation error",
        details: ["gymId is required"],
      });
    }

    // if the current user is a gym_admin, check if the gymId matches the gymId of the gym_admin
    if (currentUser.type === "gym_admin" && currentUser.gymId !== gymId) {
      return res.status(401).json({
        error: "Unauthorized, you can only fetch the members of your gym",
      });
    }

    const relationships = await GymAndGymMember.findAll({
      where: { gymId },
      include: [
        {
          model: User,
          as: "member",
          where: { type: "gym_member" },
          attributes: { exclude: ["password"] }, // Exclude password field
        },
      ],
    });

    // If no relationships found, return 404
    if (relationships.length === 0) {
      return res.status(404).json({
        error: "Not found",
        details: ["No members found for the given gymId"],
      });
    }

    const members = relationships.map((relationship) => relationship.member);

    // Log success and return JSON response
    logger.info(`Retrieved ${members.length} members for gymId ${gymId}`);
    res.status(200).json(members);
  } catch (error) {
    // Log error and return JSON response
    logger.error(`Error fetching members of gym: ${error.message}`);
    res.status(500).json({
      error: "Internal server error",
      details: [error.message],
    });
  }
};

/**
 * @swagger
 * /api/gymAndGymMember/gyms/{memberId}:
 *   get:
 *     summary: Get the gyms of a gym member
 *     tags: [GymAndGymMembers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         description: ID of the gym member
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Gyms retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Gym'
 *       401:
 *         description: Unauthorized, only admin user can fetch the gyms
 *       404:
 *         description: Gym member not found
 *       500:
 *         description: Internal server error
 */
exports.getGymsOfMember = async (req, res) => {
  const currentUser = req.user;

  try {
    // Check if the current user is an admin
    if (currentUser.type !== "admin") {
      return res.status(401).json({
        error: "Unauthorized, only admin user can fetch the gyms",
      });
    }

    const { memberId } = req.params;

    if (!memberId) {
      return res.status(400).json({
        error: "Validation error",
        details: ["memberId is required"],
      });
    }

    const relationships = await GymAndGymMember.findAll({
      where: { memberId },
      include: [
        {
          model: Gym,
          as: "gym",
        },
      ],
    });

    // If no relationships found, return 404
    if (relationships.length === 0) {
      return res.status(404).json({
        error: "Not found",
        details: ["No gyms found for the given memberId"],
      });
    }

    const gyms = relationships.map((relationship) => relationship.gym);

    // Log success and return JSON response
    logger.info(`Retrieved ${gyms.length} gyms for memberId ${memberId}`);
    res.status(200).json(gyms);
  } catch (error) {
    // Log error and return JSON response
    logger.error(`Error fetching gyms of member: ${error.message}`);
    res.status(500).json({
      error: "Internal server error",
      details: [error.message],
    });
  }
};