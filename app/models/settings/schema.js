/* jshint indent: 2 */

const async = require("async");

const Helpers = require(process.env.CWD + "/app/controllers/helper-functions/root");

module.exports = function (sequelize, DataTypes) {
  const Settings = sequelize.define(
    "settings",
    {
      id: {
        type: DataTypes.STRING(50),
        allowNull: false,
        primaryKey: true,
      },
      data: {
        type: DataTypes.JSON,
        allowNull: false,
      },
    },
    {
      tableName: "settings",
      timestamps: false,
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
