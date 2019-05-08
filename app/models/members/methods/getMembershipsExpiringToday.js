module.exports = function(Members, sequelize, DataType) {
  return function(callback) {
    Members.findAll({
      where: {
        is_member: 1,
        current_exp_membership: moment().toDate()
      }
    }).nodeify(callback);
  };
};
