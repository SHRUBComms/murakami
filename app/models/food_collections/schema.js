/* jshint indent: 2 */

var Helpers = require(process.env.CWD + "/app/helper-functions/root");

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
      collection_organisation_id: {
        type: DataTypes.STRING(15),
        allowNull: false
      },
      destination_organisations: {
        type: DataTypes.JSON,
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

  Helpers.includeAllModelMethods(
    FoodCollections,
    sequelize,
    DataTypes,
    process.env.CWD + "/app/models/food_collections/methods/"
  );

  return FoodCollections;
};
