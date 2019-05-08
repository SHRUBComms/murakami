/* jshint indent: 2 */

var async = require("async");

var Helpers = require(process.env.CWD + "/app/configs/helpful_functions");

module.exports = function(sequelize, DataTypes) {
  var Settings = sequelize.define(
    "settings",
    {
      id: {
        type: DataTypes.STRING(50),
        allowNull: false,
        primaryKey: true
      },
      data: {
        type: DataTypes.TEXT,
        allowNull: false
      }
    },
    {
      tableName: "settings",
      timestamps: false
    }
  );

  Helpers.includeAllModelMethods(
    Settings,
    sequelize,
    DataTypes,
    process.env.CWD + "/app/models/settings/methods/"
  );

  return Settings;
};
