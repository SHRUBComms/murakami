const moment = require("moment");

module.exports = function (Members, sequelize, DataTypes) {
  return function (callback) {
    Members.findAll({
      where: {
        is_member: 0,
        current_exp_membership: {
          [DataTypes.Op.lte]: moment().subtract(5, "years").subtract(6, "months").toDate(),
        },
        first_name: { [DataTypes.Op.not]: "[redacted]" },
      },
    }).nodeify(function (err, members) {
      callback(err, members);
    });
  };
};
