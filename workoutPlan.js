const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbConfig"); // Your database configuration
const User = require("./user");

const WorkoutPlans = sequelize.define(
  "WorkoutPlans",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    gym_member_id: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "id",
      },
      allowNull: false,
    },
    workout_plan_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    comments: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    workout_plan_chart: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "WorkoutPlans",
    timestamps: true,
  }
);

// Define associations
WorkoutPlans.belongsTo(User, {
  foreignKey: "gym_member_id",
});

module.exports = WorkoutPlans;