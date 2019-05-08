var moment = require("moment");

module.exports = function(Members, sequelize, DataTypes) {
  return function(member_id, length, callback) {
    Members.getById(
      member_id,
      { permissions: { members: { membershipDates: true } } },
      function(err, member) {
        if (length == "full_year") {
          member.current_init_membership = moment().toDate();
          member.current_exp_membership = moment()
            .add(12, "months")
            .toDate();
        } else if (length == "half_year") {
          member.current_init_membership = moment().toDate();
          member.current_exp_membership = moment()
            .add(6, "months")
            .toDate();
        } else if (length == "3_months") {
          member.current_init_membership = moment().toDate();
          member.current_exp_membership = moment()
            .add(3, "months")
            .toDate();
        }

        Members.update(
          {
            current_init_membership: member.current_init_membership,
            current_exp_membership: member.current_exp_membership,
            is_member: 1
          },
          { where: { member_id: member_id } }
        ).nodeify(function(err) {
          callback(err);
        });
      }
    );
  };
};
