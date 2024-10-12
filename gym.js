const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbConfig");

const Gym = sequelize.define("Gym", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  state: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  country: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  pincode: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone_number: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isNumeric: true, // Validate that phone numbers contain only digits
      len: [10], // Validate phone number length
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    validate: {
      isEmail: true, // Validate email format
    },
  },
  website: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isURL: true, // Validate URL format
    },
  },
  contact_person: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "INR",
  },
  latitude: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: -90, // Validate latitude range (-90 to 90)
      max: 90,
    },
  },
  longitude: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: -180, // Validate longitude range (-180 to 180)
      max: 180,
    },
  },
  status: {
    type: DataTypes.ENUM("active", "inactive"),
    allowNull: false,
    defaultValue: "active",
  },
}, {
  // Optional: Define indexes for frequently queried columns
  indexes: [
    {
      unique: true,
      fields: ["email"], // Index on email for faster lookups
    },
    // Add more indexes as needed
  ],
});

module.exports = Gym;
