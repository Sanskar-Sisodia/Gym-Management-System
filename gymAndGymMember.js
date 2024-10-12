const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbConfig");
const Gym = require("./gym"); // Assuming the file path to Gym model
const User = require("./user"); // Assuming the file path to User model

const GymAndGymMember = sequelize.define("GymAndGymMember", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  gymId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Gym,
      key: "id",
    },
    validate: {
      isInt: true, // Ensure gymId is an integer
    },
  },
  memberId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
    validate: {
      isInt: true, // Ensure memberId is an integer
    },
  },
});

// Define associations if not already defined
GymAndGymMember.belongsTo(User, { as: "member", foreignKey: "memberId" });
GymAndGymMember.belongsTo(Gym, { as: "gym", foreignKey: "gymId" });

module.exports = GymAndGymMember;