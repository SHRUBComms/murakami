/* jshint indent: 2 */

var DataPermissions = function(sequelize, DataTypes) {
  return sequelize.define(
    "data_permissions",
    {
      class: {
        type: DataTypes.STRING(15),
        allowNull: false,
        primaryKey: true
      },
      permissions: {
        type: DataTypes.TEXT,
        allowNull: false
      }
    },
    {
      tableName: "data_permissions",
      timestamps: false
    }
  );

  DataPermissions.getAll = require("./methods/getAll")(
    DataPermissions,
    sequelize,
    DataTypes
  );

  DataPermissions.updatePermission = require("./methods/updatePermission")(
    DataPermissions,
    sequelize,
    DataTypes
  );
};

module.exports = DataPermissions;
