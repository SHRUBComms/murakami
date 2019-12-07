module.exports = function(Transactions, sequelize, DataTypes) {
  return function(transaction_id, callback) {
    Transactions.findOne({
      where: { transaction_id: transaction_id },
      raw: true
    }).nodeify(callback);
  };
};
