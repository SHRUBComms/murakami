module.exports = function(Carbon, sequelize, DataTypes) {
  return function(transaction, callback) {
    if (Object.keys(transaction.trans_object).length > 0) {
      Carbon.generateId(function(id) {
        Carbon.create({
          transaction_id: id,
          fx_transaction_id: transaction.fx_transaction_id,
          member_id: transaction.member_id,
          user_id: transaction.user_id,
          group_id: transaction.group_id,
          trans_object: transaction.trans_object,
          method: transaction.method,
          trans_date: new Date()
        }).nodeify(function(err) {
          callback(err);
        });
      });
    } else {
      callback("Transaction object empty.");
    }
  };
};
