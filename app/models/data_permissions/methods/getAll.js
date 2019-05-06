module.exports = function(DataPermissions, sequelize, DataTypes) {
  return function(callback) {
    DataPermissions.findAll({ order: [{ class: "ASC" }] }).nodeify(function(
      err,
      dataPermissions
    ) {
      async.each(
        dataPermissions,
        function(classPermission, callback) {
          formattedPermissions[classPermission.class] = JSON.parse(
            classPermission.permissions
          );
          callback();
        },
        function() {
          callback(err, formattedPermissions);
        }
      );
    });
  };
};
