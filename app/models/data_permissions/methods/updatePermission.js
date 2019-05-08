module.exports = function(DataPermissions, sequelize, DataTypes) {
  return function(userClass, permissions, callback) {
    DataPermissions.update(
      { permissions: JSON.stringify(permissions) },
      { where: { class: userClass } }
    ).nodeify(function(err) {
      console.log(err);
      callback(err);
    });
  };
};
