/* jshint indent: 2 */

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
  FoodCollectionsOrganisations.getAll = require("./methods/getAll")(
    FoodCollectionsOrganisations,
    sequelize,
    DataTypes
  );

  FoodCollectionsOrganisations.getById = require("./methods/getById")(
    FoodCollectionsOrganisations,
    sequelize,
    DataTypes
  );

  FoodCollectionsOrganisations.add = require("./methods/add")(
    FoodCollectionsOrganisations,
    sequelize,
    DataTypes
  );

  FoodCollectionsOrganisations.updateOrganisation = require("./methods/updateOrganisation")(
    FoodCollectionsOrganisations,
    sequelize,
    DataTypes
  );

  FoodCollectionsOrganisations.updateActiveStatus = require("./methods/updateActiveStatus")(
    FoodCollectionsOrganisations,
    sequelize,
    DataTypes
  );

  FoodCollectionsOrganisations.deleteOrganisation = require("./methods/deleteOrganisation")(
    FoodCollectionsOrganisations,
    sequelize,
    DataTypes
  );

  return FoodCollectionsOrganisations;
};
