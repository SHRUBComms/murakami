module.exports = function(Carbon, sequelize, DataTypes) {
  return function(member_id, callback) {
    Carbon.findAll({ where: { member_id: member_id } }).nodeify(function(
      err,
      carbon
    ) {
      callback(null, carbon);
    });
  };
};
