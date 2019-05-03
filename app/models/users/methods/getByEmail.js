module.exports = function(Users, sequelize, DataTypes) {
  return function(email, callback) {
    Users.findOne({
      where: {
        email: email
      }
    }).nodeify(function(err, user) {
      callback(err, user);
    });
  };
};
