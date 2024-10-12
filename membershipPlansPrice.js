const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbConfig"); // Assuming you have a database configuration file
const MembershipPlan = require("./gymMembershipPlan"); // Assuming the file path to MembershipPlan model

const MembershipPlansPrice = sequelize.define(
  "MembershipPlansPrice",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    membership_plan_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: MembershipPlan,
        key: "id",
      },
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    validity_start_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    validity_end_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    comments: {
      type: DataTypes.TEXT,
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
    tableName: "MembershipPlansPrices",
    timestamps: true,
  }
);

// Define associations
MembershipPlansPrice.belongsTo(MembershipPlan, {
  foreignKey: "membership_plan_id",
});

module.exports = MembershipPlansPrice;