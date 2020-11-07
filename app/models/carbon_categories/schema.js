/* jshint indent: 2 */

var Helpers = require(process.env.CWD + "/app/controllers/helper-functions/root");

module.exports = function(sequelize, DataTypes) {
  var CarbonCategories = sequelize.define(
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
        type: DataTypes.JSON,
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

  Helpers.includeAllModelMethods(
    CarbonCategories,
    sequelize,
    DataTypes,
    process.env.CWD + "/app/models/carbon_categories/methods/"
  );

  return CarbonCategories;
};
