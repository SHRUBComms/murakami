var moment = require("moment");

module.exports = function(Members, sequelize, DataTypes) {
  return function(member_id, date, callback) {
    Members.update(
      { current_exp_membership: date },
      { where: { member_id: member_id } }
    ).nodeify(function(err) {
      if (moment(date).isBefore(moment())) {
        Members.updateStatus(member_id, 0, function() {});
      } else {
        Members.updateStatus(member_id, 1, function() {});
      }
      callback(null);
    });
  };
};
