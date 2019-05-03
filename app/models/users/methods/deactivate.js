module.exports = function(Users, sequelize, DataTypes) {
  return function(user_id, callback) {
    Users.update(
      {
        deactivated: 1
      },
      { where: { id: user_id } }
    ).nodeify(function(err) {
      callback(err);
    });
  };
};
