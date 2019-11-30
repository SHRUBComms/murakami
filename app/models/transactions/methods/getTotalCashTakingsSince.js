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
        var revenue_total = 0;
        var refund_total = 0;
        async.each(
          transactions,
          function(transaction, callback) {
            if (
              transaction.summary.paymentMethod == "cash" &&
              !isNaN(transaction.summary.totals.money)
            ) {
              if (transaction.summary.bill[0].item_id != "refund") {
                revenue_total =
                  Number(revenue_total) +
                  Number(transaction.summary.totals.money);
              } else {
                revenue_total =
                  Number(revenue_total) +
                  Number(transaction.summary.totals.money);
                refund_total =
                  Number(refund_total) +
                  Number(transaction.summary.totals.money);
              }
            }

            callback();
          },
          function() {
            callback(revenue_total, refund_total);
          }
        );
      } else {
        callback("0");
      }
    });
  };
};
