module.exports = function(Members, sequelize, DataType) {
  return function(callback) {
    Members.findAll({
      where: {
        is_member: 1,
        current_exp_membership: { [Op.lte]: moment().toDate() },
        first_name: { [Op.not]: "[redacted]" }
      }
    }).nodeify(function(err, members) {
      callback(err, members);
    });
  };
};
