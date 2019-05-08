module.exports = function(Members, sequelize, DataType) {
  return function(member_id, new_working_groups, callback) {
    Members.update(
      { working_groups: new_working_groups },
      { where: { member_id: member_id } }
    ).nodeify(function(err) {
      callback(err);
    });
  };
};
