/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    "stock_categories",
    {
      item_id: {
        type: DataTypes.STRING(25),
        allowNull: false,
        primaryKey: true
      },
      till_id: {
        type: DataTypes.STRING(25),
        allowNull: true
      },
      carbon_id: {
        type: DataTypes.STRING(6),
        allowNull: true
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      value: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      weight: {
        type: DataTypes.INTEGER(11),
        allowNull: true
      },
      needsCondition: {
        type: DataTypes.INTEGER(4),
        allowNull: false,
        defaultValue: "0"
      },
      quantity: {
        type: DataTypes.INTEGER(11),
        allowNull: true
      },
      allowTokens: {
        type: DataTypes.INTEGER(4),
        allowNull: false,
        defaultValue: "1"
      },
      member_discount: {
        type: DataTypes.INTEGER(3),
        allowNull: false,
        defaultValue: "0"
      },
      action: {
        type: DataTypes.STRING(20),
        allowNull: true
      },
      parent: {
        type: DataTypes.STRING(10),
        allowNull: true
      },
      active: {
        type: DataTypes.INTEGER(4),
        allowNull: false,
        defaultValue: "1"
      }
    },
    {
      tableName: "stock_categories"
    }
  );
};
