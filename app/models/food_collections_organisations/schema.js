/* jshint indent: 2 */

var Helpers = require(process.env.CWD + "/app/configs/helpful_functions");

module.exports = function(sequelize, DataTypes) {
  var FoodCollectionsOrganisations = sequelize.define(
    "food_collections_organisations",
    {
      organisation_id: {
        type: DataTypes.STRING(15),
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      dateCreated: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP")
      },
      active: {
        type: DataTypes.INTEGER(4),
        allowNull: false,
        defaultValue: "1"
      }
    },
    {
      tableName: "food_collections_organisations",
      timestamps: false
    }
  );

  Helpers.includeAllModelMethods(
    FoodCollectionsOrganisations,
    sequelize,
    DataTypes,
    process.env.CWD + "/app/models/food_collections_organisations/methods/"
  );

  return FoodCollectionsOrganisations;
};
