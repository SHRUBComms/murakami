var async = require("async");

module.exports = function(DataPermissions, sequelize, DataTypes) {
  return function(callback) {
    var formattedPermissions = {};
    DataPermissions.findAll({ order: [["class", "ASC"]] }).nodeify(function(
      err,
      dataPermissions
    ) {
      async.each(
        dataPermissions,
        function(classPermission, callback) {
          formattedPermissions[classPermission.class] =
            classPermission.permissions;

          callback();
        },
        function() {
          callback(err, formattedPermissions);
        }
      );
    });
  };
};
