module.exports = function(Transactions, sequelize, DataTypes) {
  return function(till_id, startDate, endDate, callback) {
    console.log(startDate, endDate);
    Transactions.findAll({
      where: {
        till_id: till_id,
        date: { [DataTypes.Op.between]: [startDate, endDate] }
      },
      order: [["date", "DESC"]]
    }).nodeify(callback);
  };
};
