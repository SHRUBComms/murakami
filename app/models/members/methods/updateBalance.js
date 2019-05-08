module.exports = function(Members, sequelize, DataType) {
  return function(member_id, new_balance, callback) {
    Members.update(
      { balance: new_balance },
      { where: { member_id: member_id } }
    ).nodeify(function(err) {
      callback(err);
    });
  };
};
