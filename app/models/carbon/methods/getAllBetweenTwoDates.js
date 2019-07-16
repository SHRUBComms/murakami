module.exports = function(Carbon, sequelize, DataTypes) {
  return function(startDate, endDate, callback) {
    Carbon.findAll({
      where: {
        trans_date: { [DataTypes.Op.between]: [startDate, endDate] }
      }
    }).nodeify(function(err, carbon) {
      callback(err, carbon);
    });
  };
};
