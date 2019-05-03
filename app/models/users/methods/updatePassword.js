module.exports = function(Users, sequelize, DataTypes) {
  return function(user_id, password, callback) {
    var query = "UPDATE login SET password = ? WHERE id = ?";
    bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(password, salt, null, function(err, hash) {
        password = hash.replace(/^\$2y(.+)$/i, "$2a$1");
        Users.update(
          {
            password: password
          },
          { where: { id: user_id } }
        ).nodeify(function(err) {
          callback(err);
        });
      });
    });
  };
};
