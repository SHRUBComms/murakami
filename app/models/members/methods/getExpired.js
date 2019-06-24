var moment = require("moment");
moment.locale("en-gb");

module.exports = function(Members, sequelize, DataTypes) {
  return function(callback) {
    Members.findAll({
      where: {
        is_member: 1,
        [DataTypes.Op.lte]: { current_exp_membership: moment().toDate() }
      }
    }).nodeify(function(err, members) {
      callback(err, members);
    });
  };
};
