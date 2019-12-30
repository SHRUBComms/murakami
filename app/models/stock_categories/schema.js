/* jshint indent: 2 */

var Helpers = require(process.env.CWD + "/app/helper-functions/root");

module.exports = function(sequelize, DataTypes) {
  var StockCategories = sequelize.define(
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
      group_id: {
        type: DataTypes.STRING(12),
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
      conditions: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
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
      },
      stockControl: {
        type: DataTypes.INTEGER(4),
        allowNull: false,
        defaultValue: "0"
      },
      stockInfo: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {}
      }
    },
    {
      tableName: "stock_categories",
      timestamps: false
    }
  );

  Helpers.includeAllModelMethods(
    StockCategories,
    sequelize,
    DataTypes,
    process.env.CWD + "/app/models/stock_categories/methods/"
  );

  return StockCategories;
};
