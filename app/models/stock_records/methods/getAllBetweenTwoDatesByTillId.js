module.exports = function(StockRecords, sequelize, DataTypes) {
  return function(till_id, startDate, endDate, callback) {
    StockRecords.findAll({
      where: {
        till_id: till_id,
        timestamp: { [DataTypes.Op.between]: [startDate, endDate] }
      },
      order: [["timestamp", "DESC"]]
    }).nodeify(function(err, records) {
      callback(err, records);
    });
  };
};
