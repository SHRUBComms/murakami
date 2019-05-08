var moment = require("moment");
moment.locale("en-gb");
module.exports = function(Attempts, sequelize, DataTypes) {
  return function(user_id, callback) {
    Attempts.findAll({
      where: {
        user_id: user_id,
        outcome: 0,
        login_timestamp: {
          [DataTypes.Op.gte]: moment()
            .subtract(60, "minutes")
            .toDate()
        }
      }
    }).nodeify(function(err, attempts) {
      callback(err, attempts);
    });
  };
};
