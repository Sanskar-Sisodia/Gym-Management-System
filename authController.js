const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const GymAndGymMember = require("../models/gymAndGymMember");
const GymAndGymAdmin = require("../models/gymAndGymAdmin");
const Gym = require("../models/gym");
const logger = require("../utils/logger");
const MembershipPlan = require("../models/gymMembershipPlan");
const MembersMembership = require("../models/membersMembership");
const MembershipPlansPrice = require("../models/membershipPlansPrice");

dotenv.config(); // Load environment variables

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication Endpoints
 */

/**
 * @swagger
 * /api/signup/admin:
 *   post:
 *     summary: Sign up a new admin user - To be deprecated
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: The username for the new admin user
 *               password:
 *                 type: string
 *                 description: The password for the new admin user
 *                 minLength: 8  # Password must be at least 8 characters long
 *     responses:
 *       200:
 *         description: The admin user was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     username:
 *                       type: string
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

exports.signupAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required." });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters long." });
    }

    let user = await User.findOne({ where: { username } });
    if (user) {
      return res.status(400).json({ error: "User already exists." });
    }

    user = await User.create({
      username,
      password: await bcrypt.hash(password, 10),
      firstName: "Admin",
      type: "admin",
    });

    const response = {
      message: "Admin user created successfully",
      user: {
        id: user.id,
        username: user.username,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error(`Error in signupAdmin: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @swagger
 * /api/signup/gymadmin:
 *   post:
 *     summary: Sign up a new gym admin user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - firstName
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 8  # Password must be at least 8 characters long
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               pincode:
 *                 type: string
 *               country:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *               profilePicture:
 *                 type: string
 *               emergencyContactName:
 *                 type: string
 *               emergencyContactRelationship:
 *                 type: string
 *               emergencyContactPhone:
 *                 type: string
 *               emergencyContactEmail:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: The gym admin user was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Gym admin user created successfully
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     username:
 *                       type: string
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Username, password, and first name are required.
 *       403:
 *         description: Forbidden, only admin user can create gym admin user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Forbidden, only admin user can create gym admin user
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

exports.signupGymAdmin = async (req, res) => {
  try {
    const {
      username,
      password,
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      country,
      dateOfBirth,
      gender,
      profilePicture,
      emergencyContactName,
      emergencyContactRelationship,
      emergencyContactPhone,
      emergencyContactEmail,
    } = req.body;
    const currentUser = req.user; // Assuming the user object is attached by middleware

    // Check if the current user is an admin
    if (currentUser.type !== "admin") {
      return res
        .status(403)
        .json({
          error: "Forbidden, only admin user can create gym admin user",
        });
    }

    if (!username || !password || !firstName) {
      return res
        .status(400)
        .json({ error: "Username, password, and first name are required." });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters long." });
    }

    if (phone && !/^\d{10}$/.test(phone)) {
      return res
        .status(400)
        .json({ error: "Phone number should be 10 digits long." });
    }

    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ error: "Invalid email format." });
    }

    let user = await User.findOne({ where: { username } });
    if (user) {
      return res.status(400).json({ error: "User already exists." });
    }

    user = await User.create({
      username,
      password: await bcrypt.hash(password, 10),
      type: "gym_admin",
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      country,
      dateOfBirth,
      gender,
      profilePicture,
      emergencyContactName,
      emergencyContactRelationship,
      emergencyContactPhone,
      emergencyContactEmail,
    });

    const response = {
      message: "Gym admin user created successfully",
      user: {
        id: user.id,
        username: user.username,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error(`Error in signupGymAdmin: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @swagger
 * /api/signup/gymmember:
 *   post:
 *     summary: Sign up a new gym member user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - firstName
 *               - gymId
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 8  # Password must be at least 8 characters long
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               pincode:
 *                 type: string
 *               country:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *               profilePicture:
 *                 type: string
 *               emergencyContactName:
 *                 type: string
 *               emergencyContactRelationship:
 *                 type: string
 *               emergencyContactPhone:
 *                 type: string
 *               emergencyContactEmail:
 *                 type: string
 *                 format: email
 *               gymId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: The gym member user was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Gym member user created successfully
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     username:
 *                       type: string
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Username, password, first name, and gym ID are required.
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
exports.signupGymMember = async (req, res) => {
  try {
    const {
      username,
      password,
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      country,
      dateOfBirth,
      gender,
      profilePicture,
      emergencyContactName,
      emergencyContactRelationship,
      emergencyContactPhone,
      emergencyContactEmail,
      gymId,
    } = req.body;

    if (!username || !password || !firstName || !gymId) {
      return res
        .status(400)
        .json({
          error: "Username, password, first name, and gym ID are required.",
        });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters long." });
    }

    if (phone && !/^\d{10}$/.test(phone)) {
      return res
        .status(400)
        .json({ error: "Phone number should be 10 digits long." });
    }

    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ error: "Invalid email format." });
    }

    // Check if the gymId exists in the Gym table
    const gym = await Gym.findByPk(gymId);
    if (!gym) {
      return res.status(400).json({ error: "Gym does not exist." });
    }

    let user = await User.findOne({ where: { username } });
    if (user) {
      return res.status(400).json({ error: "User already exists." });
    }

    user = await User.create({
      username,
      password: await bcrypt.hash(password, 10),
      type: "gym_member",
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      country,
      dateOfBirth,
      gender,
      profilePicture,
      emergencyContactName,
      emergencyContactRelationship,
      emergencyContactPhone,
      emergencyContactEmail,
    });

    // Update the GymAndGymMember table
    await GymAndGymMember.create({ gymId, memberId: user.id });

    const response = {
      message: "Gym member user created successfully",
      user: {
        id: user.id,
        username: user.username,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error(`Error in signupGymMember: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Log in an existing user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: johndoe
 *               password:
 *                 type: string
 *                 minLength: 8  # Password must be at least 8 characters long
 *                 example: password123
 *     responses:
 *       200:
 *         description: The user was successfully logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjA2NjY2MjU4LCJleHAiOjE2MDY2Njk4NTh9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ"
 *       400:
 *         description: Invalid username or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid username or password.
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
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    let user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(400).json({ error: "Invalid username or password." });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: "Invalid username or password." });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token });
  } catch (error) {
    logger.error(`Error in login: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @swagger
 * /api/userDetails:
 *   post:
 *     summary: Get current user details
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The user details are successfully retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 username:
 *                   type: string
 *                   example: johndoe
 *                 firstName:
 *                   type: string
 *                   example: John
 *                 lastName:
 *                   type: string
 *                   example: Doe
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: johndoe@example.com
 *                 phone:
 *                   type: string
 *                   example: 1234567890
 *                 address:
 *                   type: string
 *                   example: 123 Main St
 *                 city:
 *                   type: string
 *                   example: Anytown
 *                 state:
 *                   type: string
 *                   example: Anystate
 *                 pincode:
 *                   type: string
 *                   example: 123456
 *                 country:
 *                   type: string
 *                   example: Anycountry
 *                 dateOfBirth:
 *                   type: string
 *                   format: date
 *                   example: 1990-01-01
 *                 gender:
 *                   type: string
 *                   example: male
 *                 profilePicture:
 *                   type: string
 *                   example: profile_picture_url
 *                 emergencyContactName:
 *                   type: string
 *                   example: Jane Doe
 *                 emergencyContactRelationship:
 *                   type: string
 *                   example: Spouse
 *                 emergencyContactPhone:
 *                   type: string
 *                   example: 0987654321
 *                 emergencyContactEmail:
 *                   type: string
 *                   format: email
 *                   example: janedoe@example.com
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
exports.userDetails = async (req, res) => {
  try {
    const currentUser = req.user; // Assuming the user object is attached by middleware

    const user = await User.findByPk(currentUser.id, {
      attributes: { exclude: ["password"] },
    });

    res.json(user);
  } catch (error) {
    logger.error(`Error in userDetails: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @swagger
 * /api/deleteAll:
 *   delete:
 *     summary: Delete all data from the database
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: All data deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: All data deleted successfully
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
exports.deleteAll = async (req, res) => {
  try {
    const currentUser = req.user;
    if (currentUser.type !== "admin") {
      return res.status(403).json({ error: "Forbidden, only admin user can delete all data" });
    }
    await MembershipPlansPrice.destroy({ where: {} });
    await MembersMembership.destroy({ where: {} });
    await MembershipPlan.destroy({ where: {} });
    await GymAndGymMember.destroy({ where: {} });
    await GymAndGymAdmin.destroy({ where: {} });
    await Gym.destroy({ where: {} });
    await User.destroy({ where: {} });


    res.json({ message: "All data deleted successfully" });
  } catch (error) {
    logger.error(`Error in deleteAll: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
};