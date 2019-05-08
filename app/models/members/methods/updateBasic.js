module.exports = function(Members, sequelize, DataTypes) {
  return function(member, callback) {
    Members.update(
      {
        first_name: member.first_name,
        last_name: member.last_name,
        email: member.email,
        phone_no: member.phone_no || null,
        address: member.address || null
      },
      { where: { member_id: member.member_id } }
    ).nodeify(function(err) {
      callback(err);
    });
  };
};
