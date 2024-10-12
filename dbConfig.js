const { Sequelize } = require("sequelize");
require("dotenv").config(); // Load environment variables

// Remote MySQL database connection
const sequelize = new Sequelize(
  process.env.DB_NAME, // Database name
  process.env.DB_USERNAME, // Database username
  process.env.DB_PASSWORD, // Database password
  {
    host: process.env.DB_HOST, // Database host
    dialect: "mysql",
  }
);

module.exports = sequelize;