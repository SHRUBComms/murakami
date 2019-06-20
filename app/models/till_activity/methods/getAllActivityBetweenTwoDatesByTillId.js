module.exports = function(TillActivity, sequelize, DataTypes) {
  return function(till_id, startDate, endDate, callback) {
    TillActivity.findAll({
      where: {
        till_id: till_id,
        timestamp: { [DataTypes.Op.between]: [startDate, endDate] }
      },
      order: [["timestamp", "DESC"]]
    }).nodeify(function(err, activity) {
      if (!err && activity) {
        callback(null, activity);
      } else {
        callback(err, []);
      }
    });
  };
};
