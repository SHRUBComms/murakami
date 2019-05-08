module.exports = function(Members, sequelize, DataTypes) {
  return function(callback) {
    Members.findAll({
      where: {
        current_init_membership: moment().toDate(),
        earliest_membership_date: moment().toDate()
      }
    }).nodeify(function(err, members) {
      callback(err, members);
    });
  };
};
