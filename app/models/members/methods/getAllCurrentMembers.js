module.exports = function(Members, sequelize, DataType) {
  return function(callback) {
    Members.findAll({ where: { is_member: 1 } }).nodeify(function(
      err,
      members
    ) {
      callback(err, members);
    });
  };
};
