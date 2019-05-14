module.exports = function(DataPermissions, sequelize, DataTypes) {
  return function(userClass, permissions, callback) {
    DataPermissions.update(
      { permissions: permissions },
      { where: { class: userClass } }
    ).nodeify(function(err) {
      callback(err);
    });
  };
};
