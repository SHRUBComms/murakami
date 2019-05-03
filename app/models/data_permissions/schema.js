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
      tableName: "data_permissions"
    }
  );
};

DataPermissions.getAll = function(callback) {
  DataPermissions.findAll({ order: [{ class: "ASC" }] })
    .then(function(dataPermissions) {
      async.each(
        dataPermissions,
        function(classPermission, callback) {
          formattedPermissions[classPermission.class] = JSON.parse(
            classPermission.permissions
          );
          callback();
        },
        function() {
          callback(null, formattedPermissions);
        }
      );
    })
    .catch(function(err) {
      callback(err, null);
    });
};

DataPermissions.updatePermission = function(userClass, permissions, callback) {
  DataPermissions.update(
    { permissions: JSON.stringify(permissions) },
    { where: { class: userClass } }
  )
    .then(function() {
      callback(null);
    })
    .catch(function(err) {
      callback(err);
    });
};

module.exports = DataPermissions;
