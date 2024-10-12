require("dotenv").config(); // Load environment variables
const jwt = require("jsonwebtoken");
const User = require("../models/user"); // Assuming you have a User model

const logger = require("../utils/logger"); // Assuming you have a logger utility

module.exports = async (req, res, next) => {
  // Extract the token from the Authorization header
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    logger.error("Access denied. No token provided.");
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  // Split the token from the 'Bearer ' prefix
  const token = authHeader.split(" ")[1];
  if (!token) {
    logger.error("Access denied. Invalid token format.");
    return res
      .status(401)
      .json({ error: "Access denied. Invalid token format." });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch the user from the database based on the decoded id
    const user = await User.findByPk(decoded.id);
    if (!user) {
      logger.error("User not found.");
      return res.status(404).json({ error: "User not found." });
    }

    // Construct user object to attach to req.user
    const userInfo = {
      id: user.id,
      username: user.username,
      type: user.type,
      email: user.email,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      address: user.address,
      city: user.city,
      state: user.state,
      pincode: user.pincode,
      country: user.country,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      profilePicture: user.profilePicture,
      emergencyContactName: user.emergencyContactName,
      emergencyContactRelationship: user.emergencyContactRelationship,
      emergencyContactPhone: user.emergencyContactPhone,
      emergencyContactEmail: user.emergencyContactEmail,
    };

    // Attach gym_id based on user type
    if (user.type === "gym_admin") {
      // Assuming a direct association between GymAndGymAdmin and User
      const gymAdminAssociation = await user.getGymAndGymAdmin();
      if (gymAdminAssociation && gymAdminAssociation.gymId) {
        userInfo.gym_id = gymAdminAssociation.gymId;
      }
    } else if (user.type === "gym_member") {
      // Assuming a direct association between GymAndGymMember and User
      const gymMemberAssociation = await user.getGymAndGymMember();
      if (gymMemberAssociation && gymMemberAssociation.gymId) {
        userInfo.gym_id = gymMemberAssociation.gymId;
      }
    }

    // Attach user information to the request object
    req.user = userInfo;

    // Log successful authentication
    logger.info(`User authenticated: ${user.username} (${user.type})`);

    // Call the next middleware or route handler
    next();
  } catch (error) {
    logger.error("Error verifying token:", error);
    return res.status(400).json({ error: "Invalid token." });
  }
};