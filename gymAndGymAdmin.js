const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbConfig");
const User = require("./user");
const Gym = require("./gym");

const GymAndGymAdmin = sequelize.define(
  "GymAndGymAdmin",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    gymAdminId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true, // Ensure gymAdminId is an integer
      },
      references: {
        model: User,
        key: "id",
      },
    },
    gymId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true, // This ensures a gym can only be linked to one gymAdmin
      validate: {
        isInt: true, // Ensure gymId is an integer
      },
      references: {
        model: Gym,
        key: "id",
      },
    },
  },
  {
    tableName: "GymAndGymAdmins",
  }
);

// Define associations
GymAndGymAdmin.belongsTo(User, { as: "gymAdmin", foreignKey: "gymAdminId" });
GymAndGymAdmin.belongsTo(Gym, { as: "gym", foreignKey: "gymId" });

module.exports = GymAndGymAdmin;