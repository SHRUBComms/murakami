module.exports = function(Users, sequelize, DataTypes) {
  return function(username, callback) {
    Users.findOne({ where: { username: username } }).nodeify(function(
      err,
      user
    ) {
      if (user) {
        callback(err, user);
      } else {
        callback(err, null);
      }
    });
  };
};
