const { Op } = require("sequelize");
const logger = require("../utils/logger"); // Assuming logger setup in utils/logger.js
const Gym = require("../models/gym");
const GymAndGymAdmin = require("../models/gymAndGymAdmin");

/**
 * @swagger
 * components:
 *   schemas:
 *     Gym:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated ID of the gym
 *           example: 1
 *         name:
 *           type: string
 *           description: The name of the gym
 *           example: Fit Gym
 *         address:
 *           type: string
 *           description: The address of the gym
 *           example: 123 Main St
 *         city:
 *           type: string
 *           description: The city where the gym is located
 *           example: Springfield
 *         state:
 *           type: string
 *           description: The state where the gym is located
 *           example: IL
 *         country:
 *           type: string
 *           description: The country where the gym is located
 *           example: USA
 *         pincode:
 *           type: string
 *           description: The pincode of the gym's location
 *           example: 62704
 *         phone_number:
 *           type: string
 *           description: The phone number of the gym
 *           example: 1234567890
 *         email:
 *           type: string
 *           description: The email address of the gym
 *           example: contact@fitgym.com
 *         website:
 *           type: string
 *           description: The website URL of the gym
 *           example: https://www.fitgym.com
 *         contact_person:
 *           type: string
 *           description: The name of the contact person at the gym
 *           example: John Doe
 *         currency:
 *           type: string
 *           description: The currency used by the gym
 *           example: USD
 *         latitude:
 *           type: number
 *           description: The latitude coordinate of the gym's location
 *           example: 39.7817
 *         longitude:
 *           type: number
 *           description: The longitude coordinate of the gym's location
 *           example: -89.6501
 *         status:
 *           type: string
 *           description: The status of the gym
 *           example: active
 */

/**
 * @swagger
 * tags:
 *   name: Gyms
 *   description: Gym management endpoints
 */

/**
 * @swagger
 * /api/gym:
 *   post:
 *     summary: Create a new gym
 *     tags: [Gyms]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               country:
 *                 type: string
 *               pincode:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               email:
 *                 type: string
 *               website:
 *                 type: string
 *               contact_person:
 *                 type: string
 *               currency:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *     responses:
 *       200:
 *         description: Gym created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Gym'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Validation error
 *                 details:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: name is required
 *       401:
 *         description: Unauthorized, only admin user can create gym
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized, only admin user can create gym
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 *                 details:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: Detailed error message
 */

exports.createGym = async (req, res) => {
  const currentUser = req.user;

  try {
    logger.info(`Creating new gym by user ID: ${currentUser.id}`);

    if (currentUser.type !== "admin") {
      logger.warn(
        `Unauthorized attempt to create gym by user ID: ${currentUser.id}`
      );
      return res
        .status(401)
        .json({ error: "Unauthorized, only admin user can create gym" });
    }

    const requiredFields = [
      "name",
      "address",
      "city",
      "state",
      "country",
      "pincode",
      "phone_number",
      "email",
      "contact_person",
      "currency",
    ];

    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      logger.warn(`Missing required fields: ${missingFields.join(", ")}`);
      return res.status(400).json({
        error: "Validation error",
        details: missingFields.map((field) => `${field} is required`),
      });
    }

    const validationErrors = [];

    if (
      typeof req.body.latitude !== "number" ||
      typeof req.body.longitude !== "number"
    ) {
      validationErrors.push("latitude and longitude must be numbers");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.body.email)) {
      validationErrors.push("email format is invalid");
    }

    const phoneNumberRegex = /^\d{10}$/;
    if (!phoneNumberRegex.test(req.body.phone_number)) {
      validationErrors.push("phone number must be 10 digits");
    }

    const pincodeRegex = /^\d{6}$/;
    if (!pincodeRegex.test(req.body.pincode)) {
      validationErrors.push("pincode must be 6 digits");
    }

    if (validationErrors.length > 0) {
      logger.warn(`Validation errors: ${validationErrors.join(", ")}`);
      return res.status(400).json({
        error: "Validation error",
        details: validationErrors,
      });
    }

    const gym = await Gym.create(req.body);

    logger.info(`New gym created successfully with ID: ${gym.id}`);

    res.status(200).json({
      message: "Gym created successfully",
      gym: gym,
    });
  } catch (error) {
    logger.error(`Error creating gym: ${error.message}`);
    res.status(500).json({
      error: "Internal server error",
      details: [error.message],
    });
  }
};

/**
 * @swagger
 * /api/gym:
 *   get:
 *     summary: Get list of all gyms
 *     tags: [Gyms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of gyms per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: name
 *           enum: [name, address, city, state, country, phone_number, email, contact_person]
 *         description: Column to sort by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           default: asc
 *           enum: [asc, desc]
 *         description: Order of sorting (ascending or descending)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term to filter gyms by name, address, city, state, country, phone_number, email, or contact_person
 *       - in: query
 *         name: address
 *         schema:
 *           type: string
 *         description: Filter gyms by address
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filter gyms by city
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: Filter gyms by state
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *         description: Filter gyms by country
 *       - in: query
 *         name: phone_number
 *         schema:
 *           type: string
 *         description: Filter gyms by phone number
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Filter gyms by email
 *       - in: query
 *         name: contact_person
 *         schema:
 *           type: string
 *         description: Filter gyms by contact person
 *     responses:
 *       200:
 *         description: List of gyms
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Gym'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     totalItems:
 *                       type: integer
 *                       example: 100
 *                     totalPages:
 *                       type: integer
 *                       example: 10
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 *                 details:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: Detailed error message
 */
exports.getAllGyms = async (req, res) => {
  const currentUser = req.user;

  try {
    logger.info(`Fetching list of gyms by user ID: ${currentUser.id}`);

    const {
      page = 1,
      limit = 10,
      sortBy = "name",
      order = "asc",
      search,
    } = req.query;

    const validColumns = [
      "name",
      "address",
      "city",
      "state",
      "country",
      "phone_number",
      "email",
      "contact_person",
    ];

    const sanitizedSortBy = validColumns.includes(sortBy) ? sortBy : "name";
    const sanitizedOrder = order.toUpperCase() === "DESC" ? "DESC" : "ASC";

    const options = {
      offset: (page - 1) * limit,
      limit: +limit,
      order: [[sanitizedSortBy, sanitizedOrder]],
      where: {},
    };

    if (search) {
      options.where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { address: { [Op.like]: `%${search}%` } },
        { city: { [Op.like]: `%${search}%` } },
        { state: { [Op.like]: `%${search}%` } },
        { country: { [Op.like]: `%${search}%` } },
        { phone_number: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { contact_person: { [Op.like]: `%${search}%` } },
      ];
    }

    if (currentUser.type === "gym_admin" || currentUser.type === "gym_member") {
      const gymId = currentUser.gymId;
      options.where.id = gymId;
    }

    const gyms = await Gym.findAndCountAll(options);
    const totalPages = Math.ceil(gyms.count / limit);

    logger.info(
      `Successfully fetched list of gyms by user ID: ${currentUser.id}`
    );

    const response = {
      data: gyms.rows,
      meta: {
        totalItems: gyms.count,
        totalPages: totalPages,
        currentPage: +page,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error(`Error fetching gyms: ${error.message}`);
    res.status(500).json({
      error: "Internal server error",
      details: [error.message],
    });
  }
};

/**
 * @swagger
 * /api/gym/{id}:
 *   get:
 *     summary: Get gym by ID
 *     tags: [Gyms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the gym to get
 *     responses:
 *       200:
 *         description: Gym found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Gym'
 *       404:
 *         description: Gym not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Gym with ID {id} not found
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized, only admin user can view gyms
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 *                 details:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: Detailed error message
 */
exports.getGymById = async (req, res) => {
  const currentUser = req.user;

  try {
    logger.info(
      `Fetching gym by ID: ${req.params.id} by user ID: ${currentUser.id}`
    );

    if (currentUser.type === "gym_admin" || currentUser.type === "gym_member") {
      gymId = currentUser.gymId;
      // Check if user requested id is same as gym id
      if (gymId != req.params.id) {
        logger.warn(
          `Unauthorized attempt to fetch gym by ID: ${req.params.id} by user ID: ${currentUser.id}`
        );
        return res
          .status(401)
          .json({ error: "Unauthorized, only admin user can view gyms" });
      }
    }

    const { id } = req.params;
    const gym = await Gym.findByPk(id);

    if (!gym) {
      logger.warn(`Gym with ID ${id} not found`);
      return res.status(404).json({
        error: `Gym with ID ${id} not found`,
      });
    }

    logger.info(
      `Successfully fetched gym by ID: ${id} by user ID: ${currentUser.id}`
    );

    res.status(200).json(gym);
  } catch (error) {
    logger.error(
      `Error fetching gym by ID: ${req.params.id}: ${error.message}`
    );
    res.status(500).json({
      error: "Internal server error",
      details: [error.message],
    });
  }
};

/**
 * @swagger
 * /api/gym/{id}:
 *   put:
 *     summary: Update gym by ID
 *     tags: [Gyms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the gym to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Gym'
 *     responses:
 *       200:
 *         description: Gym updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Gym'
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
 *         description: Unauthorized, only admin user can update gyms
 *       404:
 *         description: Gym not found
 *       500:
 *         description: Internal server error
 */
exports.updateGymById = async (req, res) => {
  const currentUser = req.user;

  try {
    logger.info(
      `Updating gym by ID: ${req.params.id} by user ID: ${currentUser.id}`
    );

    if (currentUser.type !== "admin") {
      logger.warn(
        `Unauthorized attempt to update gym by ID: ${req.params.id} by user ID: ${currentUser.id}`
      );
      return res
        .status(401)
        .json({ error: "Unauthorized, only admin user can update gyms" });
    }

    const { id } = req.params;
    const gym = await Gym.findByPk(id);

    if (!gym) {
      logger.warn(`Gym with ID ${id} not found`);
      return res.status(404).json({
        error: `Gym with ID ${id} not found`,
      });
    }

    await gym.update(req.body);

    logger.info(
      `Successfully updated gym by ID: ${id} by user ID: ${currentUser.id}`
    );

    res.status(200).json(gym);
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      const details = error.errors.map((e) => e.message);
      logger.warn(
        `Validation errors while updating gym by ID: ${
          req.params.id
        }: ${details.join(", ")}`
      );
      return res.status(400).json({
        error: "Validation error",
        details: details,
      });
    }

    logger.error(
      `Error updating gym by ID: ${req.params.id}: ${error.message}`
    );
    res.status(500).json({
      error: "Internal server error",
      details: [error.message],
    });
  }
};

/**
 * @swagger
 * /api/gym/{id}:
 *   delete:
 *     summary: Delete gym by ID
 *     tags: [Gyms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the gym to delete
 *     responses:
 *       200:
 *         description: Gym deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Gym with ID {id} deleted successfully
 *       401:
 *         description: Unauthorized, only admin user can delete gyms
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized, only admin user can delete gyms
 *       404:
 *         description: Gym not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Gym with ID {id} not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */
exports.deleteGymById = async (req, res) => {
  const currentUser = req.user;

  try {
    logger.info(
      `Deleting gym by ID: ${req.params.id} by user ID: ${currentUser.id}`
    );

    if (currentUser.type !== "admin") {
      logger.warn(
        `Unauthorized attempt to delete gym by ID: ${req.params.id} by user ID: ${currentUser.id}`
      );
      return res
        .status(401)
        .json({ error: "Unauthorized, only admin user can delete gyms" });
    }

    const { id } = req.params;
    const gym = await Gym.findByPk(id);

    if (!gym) {
      logger.warn(`Gym with ID ${id} not found`);
      return res.status(404).json({
        error: `Gym with ID ${id} not found`,
      });
    }

    await gym.destroy();

    logger.info(
      `Successfully deleted gym by ID: ${id} by user ID: ${currentUser.id}`
    );

    res.status(200).json({
      message: `Gym with ID ${id} deleted successfully`,
    });
  } catch (error) {
    logger.error(
      `Error deleting gym by ID: ${req.params.id}: ${error.message}`
    );
    res.status(500).json({
      error: "Internal server error",
      details: [error.message],
    });
  }
};
