var async = require("async");

module.exports = function(Transactions, sequelize, DataTypes) {
  return function(till_id, timestamp, callback) {
    Transactions.findAll({
      where: {
        till_id: till_id,
        date: { [DataTypes.Op.between]: [timestamp, new Date()] }
      }
    }).nodeify(function(err, transactions) {
      if (transactions.length > 0) {
        var money_total = 0;
        async.each(
          transactions,
          function(transaction, callback) {
            if (
              transaction.summary.paymentMethod == "cash" &&
              !isNaN(transaction.summary.totals.money)
            ) {
              money_total = +money_total + +transaction.summary.totals.money;
            }

            callback();
          },
          function() {
            callback(money_total);
          }
        );
      } else {
        callback("0");
      }
    });
  };
};
