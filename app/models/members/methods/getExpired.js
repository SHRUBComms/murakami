module.exports = function(Members, sequelize, DataType) {
  return function(callback) {
    Members.findAll({
      where: {
        is_member: 1,
        [Op.lte]: { current_exp_membership: moment().toDate() }
      }
    }).nodeify(function(err, members) {
      callback(err, members);
    });
  };
};
