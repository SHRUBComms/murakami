module.exports = function(Transactions, sequelize, DataTypes) {
  return function(callback) {
    Transactions.findAll({
      order: [["date", "ASC"]]
    }).nodeify(callback);
  };
};
