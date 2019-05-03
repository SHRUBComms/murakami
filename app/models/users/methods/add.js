module.exports = function(Users, sequelize, DataTypes) {
  var add = function(user, callback) {
    Helpers.uniqueIntId(11, "users", "id", function(id) {
      user.id = id;
      bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(user.password, salt, null, function(err, hash) {
          user.password = hash.replace(/^\$2y(.+)$/i, "$2a$1");

          User.create({ user: user }).nodeify(function(err) {
            if (!err) {
              Users.getById(
                user.id,
                { permissions: { users: { name: true } } },
                callback
              );
            } else {
              callback(err);
            }
          });
        });
      });
    });
  };
  return add;
};
