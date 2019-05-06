module.exports = function(Carbon, sequelize, DataTypes) {
  return function(group_id, callback) {
    Carbon.getToday = function(callback) {
      Carbon.findAll({
        where: { group_id: group_id }
      }).nodeify(function(err, carbon) {
        callback(err, carbon);
      });
    };
  };
};
