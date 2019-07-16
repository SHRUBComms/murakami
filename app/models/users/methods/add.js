var bcrypt = require("bcrypt-nodejs");
var Helpers = require(process.env.CWD + "/app/helper-functions/root");

module.exports = function(Users, sequelize, DataTypes) {
  return function(user, callback) {
    Users.generateId(function(id) {
      user.id = id;
      user.password = Helpers.generateBase64Id("255");
      bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(user.password, salt, null, function(err, hash) {
          user.password = hash.replace(/^\$2y(.+)$/i, "$2a$1");
          Users.create({
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username,
            email: user.email,
            password: user.password,
            class: user.class,
            working_groups: user.working_groups,
            notification_preferences: user.notification_preferences,
            created_at: new Date(),
            deactivated: 1
          }).nodeify(function(err) {
            callback(err, user.id);
          });
        });
      });
    });
  };
};
