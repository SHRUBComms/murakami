module.exports = function(Carbon, sequelize, DataTypes) {
  return function(group_id, startDate, endDate, callback) {
    if (group_id) {
      Carbon.findAll({
        where: {
          group_id: group_id,
          trans_date: { [DataTypes.Op.between]: [startDate, endDate] }
        }
      }).nodeify(function(err, carbon) {
        callback(err, carbon);
      });
    } else {
      callback(null, []);
    }
  };
};
