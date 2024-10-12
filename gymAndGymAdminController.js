const { Op } = require("sequelize");
const GymAndGymAdmin = require("../models/gymAndGymAdmin");
const User = require("../models/user");
const Gym = require("../models/gym");
const logger = require("../utils/logger");

/**
 * @swagger
 * components:
 *   schemas:
 *     GymAndGymAdmin:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         gymAdmin:
 *           $ref: '#/components/schemas/UserWithoutPassword'
 *         gym:
 *           $ref: '#/components/schemas/Gym'
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
 *           description: Username of the gym admin
 *         type:
 *           type: string
 *           description: Type of user (e.g., gym_admin)
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
 * /api/gymAndGymAdmin:
 *   post:
 *     summary: Create a relationship between a gym and a gym admin
 *     tags: [GymAndGymAdmins]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               gymAdminId:
 *                 type: integer
 *                 description: ID of the gym admin
 *               gymId:
 *                 type: integer
 *                 description: ID of the gym
 *     responses:
 *       200:
 *         description: Relationship created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GymAndGymAdmin'
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
 *         description: Conflict, gym or gym admin is already linked to another entity
 *       500:
 *         description: Internal server error
 */
exports.createGymAndGymAdmin = async (req, res) => {
  const currentUser = req.user;

  try {
    // Check if the current user is an admin
    if (currentUser.type !== "admin") {
      throw new Error(
        "Unauthorized, only admin user can create the relationship"
      );
    }

    const { gymAdminId, gymId } = req.body;

    // Check for required fields
    if (!gymAdminId || !gymId) {
      throw new Error("Validation error: gymAdminId and gymId are required");
    }

    // Ensure the gymAdminId refers to a user of type gym_admin and the gymId exists
    const [gymAdmin, gym] = await Promise.all([
      User.findOne({
        where: { id: gymAdminId, type: "gym_admin" },
        attributes: { exclude: ["password"] }, // Exclude password field
      }),
      Gym.findByPk(gymId),
    ]);

    const errors = [];
    if (!gymAdmin) {
      errors.push("The gymAdminId must refer to a user of type 'gym_admin'");
    }
    if (!gym) {
      errors.push("The gymId must refer to an existing gym");
    }
    if (errors.length > 0) {
      throw new Error(`Validation error: ${errors.join(", ")}`);
    }

    // Check if gym admin is already linked to another gym
    const existingGymForAdmin = await GymAndGymAdmin.findOne({
      where: { gymAdminId },
    });
    if (existingGymForAdmin) {
      throw new Error(
        "Conflict: This gym admin is already linked to another gym"
      );
    }

    // Check if gym is already linked to another gym admin
    const existingAdminForGym = await GymAndGymAdmin.findOne({
      where: { gymId },
    });
    if (existingAdminForGym) {
      throw new Error(
        "Conflict: This gym is already linked to another gym admin"
      );
    }

    // Create the relationship
    const relationship = await GymAndGymAdmin.create({ gymAdminId, gymId });

    // Fetch associated gym admin and gym details
    const response = await GymAndGymAdmin.findByPk(relationship.id, {
      include: [
        {
          model: User,
          as: "gymAdmin",
          where: { type: "gym_admin" },
          attributes: { exclude: ["password"] },
        },
        {
          model: Gym,
          as: "gym",
        },
      ],
    });

    // Log success and return JSON response
    logger.info(
      `Relationship created successfully: ${JSON.stringify(response)}`
    );
    res.status(200).json(response);
  } catch (error) {
    // Log error and return JSON response
    logger.error(
      `Error creating gymAndGymAdmin relationship: ${error.message}`
    );
    res.status(500).json({
      error: "Internal server error",
      details: [error.message],
    });
  }
};

/**
 * @swagger
 * /api/gymAndGymAdmin/{id}:
 *   delete:
 *     summary: Delete a GymAndGymAdmin record
 *     tags: [GymAndGymAdmins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the GymAndGymAdmin record to delete
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: GymAndGymAdmin record deleted successfully
 *       401:
 *         description: Unauthorized, only admin user can delete the relationship
 *       404:
 *         description: GymAndGymAdmin record not found
 *       500:
 *         description: Internal server error
 */
exports.deleteGymAndGymAdmin = async (req, res) => {
  const currentUser = req.user;

  try {
    // Check if the current user is an admin
    if (currentUser.type !== "admin") {
      throw new Error(
        "Unauthorized, only admin user can delete the relationship"
      );
    }

    const { id } = req.params;

    // Find the GymAndGymAdmin record to delete
    const relationship = await GymAndGymAdmin.findByPk(id);

    // If record not found, return 404
    if (!relationship) {
      throw new Error("Not found: GymAndGymAdmin record not found");
    }

    // Delete the GymAndGymAdmin record
    await GymAndGymAdmin.destroy({ where: { id } });

    // Log success and return 204 indicating successful deletion
    logger.info(`Relationship deleted successfully: ${id}`);
    const response = { message: "GymAndGymAdmin record deleted successfully" };
    res.status(204).json(response);
  } catch (error) {
    // Log error and return JSON response
    logger.error(
      `Error deleting gymAndGymAdmin relationship: ${error.message}`
    );
    res.status(500).json({
      error: "Internal server error",
      details: [error.message],
    });
  }
};

/**
 * @swagger
 * /api/gymAndGymAdmin:
 *   get:
 *     summary: Get all gymAndGymAdmin relationships
 *     tags: [GymAndGymAdmins]
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
 *         description: GymAndGymAdmin relationships retrieved successfully
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
 *                     $ref: '#/components/schemas/GymAndGymAdmin'
 *       401:
 *         description: Unauthorized, only admin user can fetch the relationships
 *       500:
 *         description: Internal server error
 */
exports.getAllGymAndGymAdmins = async (req, res) => {
  const currentUser = req.user;

  try {
    // only admin and gym_admin can fetch the relationships
    if (currentUser.type !== "admin" && currentUser.type !== "gym_admin") {
      throw new Error(
        "Unauthorized, only admin and gym_admin users can fetch the relationships"
      );
    }

    const { draw, start = 0, length = 10, search, order } = req.query;
    const page = parseInt(start) / parseInt(length) + 1;
    const limit = parseInt(length);

    // Define sorting
    const orderColumnIndex = order ? parseInt(order[0].column) : 0;
    const orderDirection = order ? order[0].dir : "asc";
    const orderFields = ["id", "gymAdminId", "gymId"]; // Adjust based on actual fields
    const sortField = orderFields[orderColumnIndex] || "id";

    const searchValue = search ? search.value : "";

    const whereClause = searchValue
      ? {
          [Op.or]: [
            { "$gymAdmin.username$": { [Op.like]: `%${searchValue}%` } },
            { "$gym.name$": { [Op.like]: `%${searchValue}%` } },
          ],
        }
      : {};

    if (currentUser.type === "gym_admin") {
      whereClause.gymAdminId = currentUser.id;
    }

    // Fetch GymAndGymAdmin relationships
    const relationships = await GymAndGymAdmin.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "gymAdmin",
          where: { type: "gym_admin" },
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
    logger.info(`Fetched ${relationships.count} gymAndGymAdmin relationships`);
    res.status(200).json({
      draw: parseInt(draw),
      recordsTotal: relationships.count,
      recordsFiltered: relationships.count,
      data: relationships.rows,
    });
  } catch (error) {
    // Log error and return JSON response
    logger.error(
      `Error fetching all gymAndGymAdmin relationships: ${error.message}`
    );
    res.status(500).json({
      error: "Internal server error",
      details: [error.message],
    });
  }
};

/**
 * @swagger
 * /api/gymAndGymAdmin/gymAdmins/{gymId}:
 *   get:
 *     summary: Get the gymAdmins of a gym
 *     tags: [GymAndGymAdmins]
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
 *         description: GymAdmins retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserWithoutPassword'
 *       401:
 *         description: Unauthorized, only admin user can fetch the gymAdmins
 *       404:
 *         description: Gym not found
 *       500:
 *         description: Internal server error
 */
exports.getGymAdminsOfGym = async (req, res) => {
  const currentUser = req.user;

  try {
    // Check if the current user is an admin
    if (currentUser.type !== "admin") {
      throw new Error("Unauthorized, only admin user can fetch the gymAdmins");
    }

    const { gymId } = req.params;

    if (!gymId) {
      throw new Error("Validation error: gymId is required");
    }

    // Fetch GymAdmins of the gym
    const relationships = await GymAndGymAdmin.findAll({
      where: { gymId },
      include: [
        {
          model: User,
          as: "gymAdmin",
          where: { type: "gym_admin" },
          attributes: { exclude: ["password"] },
        },
      ],
    });

    // If no relationships found, return 404
    if (relationships.length === 0) {
      throw new Error("Not found: No gym admins found for the given gymId");
    }

    // Extract gym admins and return JSON response
    const gymAdmins = relationships.map(
      (relationship) => relationship.gymAdmin
    );
    res.status(200).json(gymAdmins);
  } catch (error) {
    // Log error and return JSON response
    logger.error(`Error fetching gymAdmins of gym: ${error.message}`);
    res.status(500).json({
      error: "Internal server error",
      details: [error.message],
    });
  }
};

/**
 * @swagger
 * /api/gymAndGymAdmin/gyms/{gymAdminId}:
 *   get:
 *     summary: Get the gyms of a gymAdmin
 *     tags: [GymAndGymAdmins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: gymAdminId
 *         required: true
 *         description: ID of the gymAdmin
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
 *         description: GymAdmin not found
 *       500:
 *         description: Internal server error
 */
exports.getGymsOfGymAdmin = async (req, res) => {
  const currentUser = req.user;

  try {
    // Check if the current user is an admin
    if (currentUser.type !== "admin") {
      throw new Error("Unauthorized, only admin user can fetch the gyms");
    }

    const { gymAdminId } = req.params;

    if (!gymAdminId) {
      throw new Error("Validation error: gymAdminId is required");
    }

    // Fetch Gyms of the gymAdmin
    const relationships = await GymAndGymAdmin.findAll({
      where: { gymAdminId },
      include: [
        {
          model: Gym,
          as: "gym",
        },
      ],
    });

    // If no relationships found, return 404
    if (relationships.length === 0) {
      throw new Error("Not found: No gyms found for the given gymAdminId");
    }

    // Extract gyms and return JSON response
    const gyms = relationships.map((relationship) => relationship.gym);
    res.status(200).json(gyms);
  } catch (error) {
    // Log error and return JSON response
    logger.error(`Error fetching gyms of gymAdmin: ${error.message}`);
    res.status(500).json({
      error: "Internal server error",
      details: [error.message],
    });
  }
};