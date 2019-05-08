module.exports = function(Members, sequelize, DataType) {
  return function(member_id, state, callback) {
    Members.update(
      { is_member: state },
      { where: { member_id: member_id } }
    ).nodeify(function(err) {
      callback(err);
    });
  };
};
