var moment = require("moment");

module.exports = function(AccessTokens, sequelize, DataTypes) {
  return function(token, callback) {
    AccessTokens.findOne({
      where: {
        token: token
      }
    }).nodeify(function(err, invite) {
      callback(err, invite);
    });
  };
};
