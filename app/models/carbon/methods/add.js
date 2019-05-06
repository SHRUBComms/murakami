module.exports = function(Carbon, sequelize, DataTypes) {
  return function(transaction, callback) {
    if (transaction.amount > 0) {
      Helpers.uniqueIntId(20, "carbon", "transaction_id", function(id) {
        Carbon.create({
          transaction_id: transaction.id,
          member_id: transaction.member_id,
          user_id: transaction.user_id,
          group_id: transaction.group_id,
          trans_object: ransaction.trans_object,
          method: transaction.method,
          trans_date: new Date()
        }).nodeify(function(err) {
          callback(err);
        });
      });
    } else {
      callback("Error");
    }
  };
};
