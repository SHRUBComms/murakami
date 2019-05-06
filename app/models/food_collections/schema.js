/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  var FoodCollections = sequelize.define(
    "food_collections",
    {
      transaction_id: {
        type: DataTypes.STRING(15),
        allowNull: false,
        primaryKey: true
      },
      member_id: {
        type: DataTypes.STRING(11),
        allowNull: false
      },
      organisation_id: {
        type: DataTypes.STRING(15),
        allowNull: false
      },
      timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP")
      },
      amount: {
        type: DataTypes.STRING(5),
        allowNull: false
      },
      note: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      approved: {
        type: DataTypes.INTEGER(4),
        allowNull: true
      }
    },
    {
      tableName: "food_collections",
      timestamps: false
    }
  );
  FoodCollections.sanitizeCollection = require("./methods/sanitizeCollection");

  FoodCollections.getCollectionsBetweenTwoDatesByOrganisation = require("./methods/getCollectionsBetweenTwoDatesByOrganisation")(
    FoodCollections,
    sequelize,
    DataTypes
  );

  FoodCollections.getCollectionsByOrganisationId = require("./methods/getCollectionsByOrganisationId")(
    FoodCollections,
    sequelize,
    DataTypes
  );

  FoodCollections.getUnreviewedCollections = require("./methods/getUnreviewedCollections")(
    FoodCollections,
    sequelize,
    DataTypes
  );

  FoodCollections.getById = require("./methods/getById")(
    FoodCollections,
    sequelize,
    DataTypes
  );

  FoodCollections.approveCollection = require("./methods/approveCollection")(
    FoodCollections,
    sequelize,
    DataTypes
  );

  FoodCollections.denyCollection = require("./methods/denyCollection")(
    FoodCollections,
    sequelize,
    DataTypes
  );

  FoodCollections.add = require("./methods/add")(
    FoodCollections,
    sequelize,
    DataTypes
  );
};
