const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbConfig"); // Assuming you have a database configuration file
const Gym = require("./gym"); // Assuming the file path to Gym model

const MembershipPlan = sequelize.define("MembershipPlan", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  gym_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Gym,
      key: "id",
    },
  },
  plan_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  plan_description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  duration_type: {
    type: DataTypes.ENUM("days", "months", "years"),
    allowNull: false,
  },
  duration_value: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});


// Define associations
MembershipPlan.belongsTo(Gym, {
  foreignKey: "gym_id",
});

module.exports = MembershipPlan;