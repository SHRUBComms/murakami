module.exports = function(Members, sequelize, DataTypes) {
  return function(member, callback) {
    Members.generateId(function(id) {
      member.member_id = id;

      Members.create({
        member_id: member.member_id,
        first_name: member.first_name,
        last_name: member.last_name,
        email: member.email,
        phone_no: member.phone_no,
        address: member.address,
        is_member: 1,
        free: member.free,
        balance: 0,
        membership_type: member.membership_type,
        earliest_membership_date: member.earliest_membership_date,
        current_init_membership: member.current_init_membership,
        current_exp_membership: member.current_exp_membership
      }).nodeify(function(err) {
        callback(err, member.member_id);
      });
    });
  };
};
