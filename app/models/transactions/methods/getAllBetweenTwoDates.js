module.exports = function(Transactions, sequelize, DataTypes) {
  return function(startDate, endDate, callback) {
    Transactions.findAll({
      where: {
        date: { [DataTypes.Op.between]: [startDate, endDate] }
      },
      order: [["date", "DESC"]]
    }).nodeify(callback);
  };
};
