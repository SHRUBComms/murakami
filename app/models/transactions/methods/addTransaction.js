module.exports = function(Transactions, sequelize, DataTypes) {
  return function(transaction, callback) {
    Transactions.generateId(function(id) {
      transaction.transaction_id = id;

      Transactions.create({
        transaction_id: transaction.transaction_id,
        till_id: transaction.till_id,
        user_id: transaction.user_id,
        member_id: transaction.member_id,
        date: transaction.date,
        summary: transaction.summary
      }).nodeify(function(err) {
        callback(err, transaction.transaction_id);
      });
    });
  };
};
