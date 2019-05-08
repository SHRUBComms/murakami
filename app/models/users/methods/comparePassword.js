var bcrypt = require("bcrypt-nodejs");

module.exports = function(Users, sequelize, DataTypes) {
  return function(candidatePassword, hash, callback) {
    hash = hash.replace(/^\$2y(.+)$/i, "$2a$1");
    bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, isMatch);
      }
    });
  };
};
