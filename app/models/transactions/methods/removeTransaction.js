module.exports = function(Transactions, sequelize, DataTypes) {
  return function(transaction_id, group_id, callback) {
    Transactions.findOne({ where: { transaction_id: transaction_id } }).nodeify(
      function(err, transaction) {
        query =
          "DELETE FROM transactions WHERE transaction_id = ?; DELETE FROM carbon WHERE (trans_date >= ? AND trans_date <= DATE_ADD(?, INTERVAL 2 SECOND)) AND group_id = ?";
        inserts = [
          transaction_id,
          transaction.date,
          transaction.date,
          group_id
        ];
        sequelize.query(query, { replacements: inserts }).nodeify(callback);
      }
    );
  };
};
