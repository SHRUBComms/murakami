var moment = require("moment");

module.exports = function(AccessTokens, sequelize, DataTypes) {
  return function(token, callback) {
    AccessTokens.findOne({
      where: {
        token: token,
        used: 0,
        timestamp: {
          [DataTypes.Op.gte]: moment()
            .subtract(24, "hours")
            .toDate()
        }
      }
    }).nodeify(function(err, invite) {
      callback(err, invite);
    });
  };
};
