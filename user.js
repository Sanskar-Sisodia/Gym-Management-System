const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbConfig");

const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notNull: true, // Ensure username is not null
      notEmpty: true, // Ensure username is not empty
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: true, // Ensure password is not null
      notEmpty: true, // Ensure password is not empty
    },
  },
  type: {
    type: DataTypes.ENUM("admin", "gym_admin", "gym_member"),
    allowNull: false,
    defaultValue: "gym_member", // Set default value if needed
    validate: {
      notNull: true, // Ensure type is not null
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    validate: {
      isEmail: true, // Ensure email is in valid format
    },
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      is: /^\d{10}$/, // Ensure phone number is 10 digits
    },
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: true, // Ensure firstName is not null
      notEmpty: true, // Ensure firstName is not empty
    },
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  state: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  pincode: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [6], // Ensure pincode is 6 characters long
    },
  },
  country: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY, // Date without time
    allowNull: true,
    validate: {
      isDate: true, // Ensure dateOfBirth is a valid date
    },
  },
  gender: {
    type: DataTypes.ENUM("male", "female", "other"),
    allowNull: true,
  },
  profilePicture: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  emergencyContactName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  emergencyContactPhone: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      is: /^\d{10}$/, // Ensure emergency contact phone number is 10 digits
    },
  },
  emergencyContactRelation: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM("active", "inactive"),
    allowNull: false,
    defaultValue: "active", // Set default value if needed
    validate: {
      notNull: true, // Ensure status is not null
    },
  },
});

module.exports = User;
