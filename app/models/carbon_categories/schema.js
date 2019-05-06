/* jshint indent: 2 */

var CarbonCategories = function(sequelize, DataTypes) {
  return sequelize.define(
    "carbon_categories",
    {
      carbon_id: {
        type: DataTypes.STRING(6),
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      factors: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      active: {
        type: DataTypes.INTEGER(4),
        allowNull: false,
        defaultValue: "1"
      }
    },
    {
      tableName: "carbon_categories",
      timestamps: false
    }
  );
  CarbonCategories.getById = require("./methods/getById")(
    CarbonCategories,
    sequelize,
    DataTypes
  );
  CarbonCategories.getAll = require("./methods/getAll")(
    CarbonCategories,
    sequelize,
    DataTypes
  );
  CarbonCategories.updateCategory = require("./methods/updateCategory")(
    CarbonCategories,
    sequelize,
    DataTypes
  );
};

module.exports = CarbonCategories;
