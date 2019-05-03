module.exports = function(Users, sequelize, DataTypes) {
  return function(usernameOrEmail, callback) {
    Users.findOne({
      where: {
        [DataTypes.Op.or]: [
          { email: usernameOrEmail },
          { username: usernameOrEmail }
        ]
      }
    }).nodeify(function(err, user) {
      if (user) {
        callback(err, user);
      } else {
        callback(err, null);
      }
    });
  };
};
