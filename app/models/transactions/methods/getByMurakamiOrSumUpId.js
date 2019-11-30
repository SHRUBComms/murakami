module.exports = function(Transactions, sequelize, DataTypes) {
  return function(till_id, transaction_id, callback) {
    Transactions.findOne({
      where: {
        till_id: till_id,
        [DataTypes.Op.or]: [
          { transaction_id: transaction_id },
          { summary: { sumupId: transaction_id } }
        ]
      }
    }).nodeify(callback);
  };
};
