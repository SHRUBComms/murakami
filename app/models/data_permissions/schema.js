/* jshint indent: 2 */

var Helpers = require(process.env.CWD + "/app/helper-functions/root");

module.exports = function(sequelize, DataTypes) {
  var DataPermissions = sequelize.define(
    "data_permissions",
    {
      class: {
        type: DataTypes.STRING(15),
        allowNull: false,
        primaryKey: true
      },
      permissions: {
        type: DataTypes.JSON,
        allowNull: false
      }
    },
    {
      tableName: "data_permissions",
      timestamps: false
    }
  );

  Helpers.includeAllModelMethods(
    DataPermissions,
    sequelize,
    DataTypes,
    process.env.CWD + "/app/models/data_permissions/methods/"
  );

  return DataPermissions;
};
