const { Op } = require("sequelize");
const User = require("../models/user");
const logger = require("../utils/logger");

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated ID of the user
 *           example: 1
 *         username:
 *           type: string
 *           description: The username of the user
 *           example: johndoe
 *         type:
 *           type: string
 *           description: The type of user (admin, gym_admin, gym_member)
 *           example: gym_member
 *         email:
 *           type: string
 *           description: The email address of the user
 *           example: johndoe@example.com
 *         phone:
 *           type: string
 *           description: The phone number of the user
 *           example: 1234567890
 *         firstName:
 *           type: string
 *           description: The first name of the user
 *           example: John
 *         lastName:
 *           type: string
 *           description: The last name of the user
 *           example: Doe
 *         address:
 *           type: string
 *           description: The address of the user
 *           example: 123 Main St
 *         city:
 *           type: string
 *           description: The city where the user resides
 *           example: Springfield
 *         state:
 *           type: string
 *           description: The state where the user resides
 *           example: IL
 *         pincode:
 *           type: string
 *           description: The pincode of the user's location
 *           example: 62704
 *         country:
 *           type: string
 *           description: The country where the user resides
 *           example: USA
 *         dateOfBirth:
 *           type: string
 *           format: date
 *           description: The date of birth of the user
 *           example: 1990-01-01
 *         gender:
 *           type: string
 *           description: The gender of the user
 *           example: male
 *         profilePicture:
 *           type: string
 *           description: URL to the user's profile picture
 *           example: https://example.com/profile.jpg
 *         emergencyContactName:
 *           type: string
 *           description: The name of the user's emergency contact
 *           example: Jane Doe
 *         emergencyContactPhone:
 *           type: string
 *           description: The phone number of the user's emergency contact
 *           example: 9876543210
 *         emergencyContactRelation:
 *           type: string
 *           description: The relation of the user's emergency contact to the user
 *           example: Parent
 *         status:
 *           type: string
 *           description: The status of the user (active or inactive)
 *           example: active
 *     UserWithoutID:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *           description: The username of the user
 *           example: johndoe
 *         type:
 *           type: string
 *           description: The type of user (admin, gym_admin, gym_member)
 *           example: gym_member
 *         email:
 *           type: string
 *           description: The email address of the user
 *           example: johndoe@example.com
 *         phone:
 *           type: string
 *           description: The phone number of the user
 *           example: 1234567890
 *         firstName:
 *           type: string
 *           description: The first name of the user
 *           example: John
 *         lastName:
 *           type: string
 *           description: The last name of the user
 *           example: Doe
 *         address:
 *           type: string
 *           description: The address of the user
 *           example: 123 Main St
 *         city:
 *           type: string
 *           description: The city where the user resides
 *           example: Springfield
 *         state:
 *           type: string
 *           description: The state where the user resides
 *           example: IL
 *         pincode:
 *           type: string
 *           description: The pincode of the user's location
 *           example: 62704
 *         country:
 *           type: string
 *           description: The country where the user resides
 *           example: USA
 *         dateOfBirth:
 *           type: string
 *           format: date
 *           description: The date of birth of the user
 *           example: 1990-01-01
 *         gender:
 *           type: string
 *           description: The gender of the user
 *           example: male
 *         profilePicture:
 *           type: string
 *           description: URL to the user's profile picture
 *           example: https://example.com/profile.jpg
 *         emergencyContactName:
 *           type: string
 *           description: The name of the user's emergency contact
 *           example: Jane Doe
 *         emergencyContactPhone:
 *           type: string
 *           description: The phone number of the user's emergency contact
 *           example: 9876543210
 *         emergencyContactRelation:
 *           type: string
 *           description: The relation of the user's emergency contact to the user
 *           example: Parent
 *         status:
 *           type: string
 *           description: The status of the user (active or inactive)
 *           example: active
 */

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: API endpoints for managing users
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get list of users
 *     description: Retrieve a list of users. The response depends on the user's role. Admins can see all users, gym admins can see their gym members, and gym members can only see themselves.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: The page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *         description: The number of items to return per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [id, username, firstName, lastName, email, type, status, phone, address, city, state, pincode, country, dateOfBirth, gender, profilePicture, emergencyContactName, emergencyContactPhone, emergencyContactRelation]
 *           default: id
 *         description: The field to sort by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: The sort order (ascending or descending)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term to filter users by username, firstName, lastName, email, etc.
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     totalItems:
 *                       type: integer
 *                       example: 20
 *                     totalPages:
 *                       type: integer
 *                       example: 2
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *       401:
 *         description: Unauthorized, user does not have permission
 *       500:
 *         description: Internal server error
 */
exports.getAllUsers = async (req, res) => {
  const currentUser = req.user;

  const {
    page = 1,
    limit = 10,
    sortBy = "id",
    order = "asc",
    search = "",
    ...filters
  } = req.query;

  const pageNumber = isNaN(parseInt(page, 10))
    ? 1
    : Math.max(1, parseInt(page, 10));
  const limitNumber = isNaN(parseInt(limit, 10))
    ? 10
    : Math.max(1, parseInt(limit, 10));
  const offset = (pageNumber - 1) * limitNumber;

  const validColumns = [
    "id",
    "username",
    "firstName",
    "lastName",
    "email",
    "type",
    "status",
    "phone",
    "address",
    "city",
    "state",
    "pincode",
    "country",
    "dateOfBirth",
    "gender",
    "profilePicture",
    "emergencyContactName",
    "emergencyContactPhone",
    "emergencyContactRelation",
  ];

  const sanitizedSortBy = validColumns.includes(sortBy) ? sortBy : "id";
  const orderCondition = [
    [sanitizedSortBy, order.toLowerCase() === "desc" ? "desc" : "asc"],
  ];

  const filterConditions = Object.entries(filters).reduce(
    (acc, [key, value]) => {
      if (value && validColumns.includes(key)) {
        acc[key] = { [Op.like]: `%${value}%` };
      }
      return acc;
    },
    {}
  );

  try {
    let whereCondition = {
      [Op.or]: validColumns.map((col) => ({
        [col]: { [Op.like]: `%${search}%` },
      })),
    };

    if (currentUser.type === "gym_admin") {
      const gymMembers = await GymAndGymMember.findAll({
        where: {
          gymId: currentUser.gym_id,
        },
        attributes: ["memberId"],
      });

      const memberIds = gymMembers.map((member) => member.memberId);
      whereCondition = {
        ...whereCondition,
        id: { [Op.in]: memberIds },
        type: "gym_member",
      };
    } else if (currentUser.type === "gym_member") {
      whereCondition = {
        ...whereCondition,
        id: currentUser.id,
      };
    }

    const { count, rows } = await User.findAndCountAll({
      where: {
        ...filterConditions,
        ...whereCondition,
      },
      attributes: { exclude: ["password"] },
      order: orderCondition,
      limit: limitNumber,
      offset,
    });

    res.status(200).json({
      data: rows,
      meta: {
        totalItems: count,
        totalPages: Math.ceil(count / limitNumber),
        currentPage: pageNumber,
      },
    });
  } catch (error) {
    logger.error("Error fetching users:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};
/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     description: Retrieve a user by their ID. Access is restricted based on user role.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the user
 *     responses:
 *       200:
 *         description: The user data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - User doesn't have permission to access this data
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
exports.getUserById = async (req, res) => {
  const currentUser = req.user;
  const { id } = req.params;

  // Check if user has permission to access this data
  if (
    currentUser.type !== "admin" &&
    currentUser.id !== parseInt(id, 10) &&
    currentUser.type !== "gym_admin"
  ) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  // Additional check for gym_admin
  if (currentUser.type === "gym_admin") {
    const gymMember = await GymAndGymMember.findOne({
      where: {
        gymId: currentUser.gym_id,
        memberId: id,
      },
    });

    if (!gymMember) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }
  }

  // Additional check for gym_member
  if (
    currentUser.type === "gym_member" &&
    currentUser.id !== parseInt(id, 10)
  ) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  try {
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Remove password from the response
    user.password = undefined;

    res.status(200).json(user);
  } catch (error) {
    logger.error("Error fetching user by ID:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update a user by ID
 *     description: Update a user's information. Access and update capabilities are restricted based on user role.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserWithoutID'
 *     responses:
 *       200:
 *         description: The updated user data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - User doesn't have permission to update this data
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
exports.updateUser = async (req, res) => {
  const currentUser = req.user;
  const { id } = req.params;
  const updateUserRequest = req.body;

  // Check if user has permission to update this data
  if (
    currentUser.type !== "admin" &&
    currentUser.id !== parseInt(id, 10) &&
    currentUser.type !== "gym_admin"
  ) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  // Additional check for gym_admin
  if (currentUser.type === "gym_admin") {
    const gymMember = await GymAndGymMember.findOne({
      where: {
        gymId: currentUser.gym_id,
        memberId: id,
      },
    });

    if (!gymMember) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }
  }

  // Prevent gym_member from updating status
  if (currentUser.type === "gym_member" && updateUserRequest.status) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  // Ensure gym_member can only update their own profile
  if (
    currentUser.type === "gym_member" &&
    currentUser.id !== parseInt(id, 10)
  ) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  try {
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    await user.update(updateUserRequest);
    user.password = undefined;

    res.status(200).json(user);
  } catch (error) {
    logger.error("Error updating user:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     description: Delete a user. This operation is restricted to admin users only.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the user
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized - User doesn't have permission to delete users
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
exports.deleteUser = async (req, res) => {
  const currentUser = req.user;
  const { id } = req.params;

  // Check for user permissions
  if (currentUser.type !== "admin") {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  try {
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    await user.destroy();

    res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    logger.error("Error deleting user:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};