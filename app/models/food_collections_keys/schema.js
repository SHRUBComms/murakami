/* jshint indent: 2 */

var Helpers = require(process.env.CWD + "/app/helper-functions/root");

module.exports = function(sequelize, DataTypes) {
  var FoodCollectionsKeys = sequelize.define(
    "food_collections_keys",
    {
      member_id: {
        type: DataTypes.STRING(25),
        allowNull: false,
        unique: true
      },
      key: {
        type: DataTypes.STRING(25),
        unique: true,
        primaryKey: true,
        allowNull: false
      },
      organisations: {
        type: DataTypes.JSON,
        allowNull: false
      },
      last_updated: {
        type: DataTypes.DATE,
        allowNull: false
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: 1
      }
    },
    {
      tableName: "food_collections_keys",
      timestamps: false
    }
  );

  Helpers.includeAllModelMethods(
    FoodCollectionsKeys,
    sequelize,
    DataTypes,
    process.env.CWD + "/app/models/food_collections_keys/methods/"
  );

  return FoodCollectionsKeys;
};
