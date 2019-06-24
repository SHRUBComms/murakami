module.exports = function(Transactions, sequelize, DataTypes) {
  return function(till_id, startDate, endDate, callback) {
    Transactions.findAll({
      where: {
        till_id: till_id,
        date: { [DataTypes.Op.between]: [startDate, endDate] }
      },
      order: [["date", "DESC"]]
    }).nodeify(function(err, transactions) {
      callback(err, transactions);
    });
  };
};
