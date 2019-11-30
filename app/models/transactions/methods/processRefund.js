module.exports = function(Transactions, sequelize, DataTypes) {
  return function(refundAmount, transactionToRefund, callback) {
    Transactions.addTransaction(
      {
        till_id: transactionToRefund.till_id,
        user_id: transactionToRefund.user_id,
        member_id: transactionToRefund.member_id || "anon",
        date: new Date(),
        summary: {
          paymentMethod: transactionToRefund.summary.paymentMethod,
          refundedTransactionId: transactionToRefund.transaction_id,
          bill: [
            {
              value: Number(refundAmount).toFixed(2),
              item_id: "refund"
            }
          ],
          totals: {
            money: refundAmount
          },
          comment:
            (Number(transactionToRefund.summary.totals.money).toFixed(2) ==
            Number(refundAmount).toFixed(2)
              ? "Complete"
              : "Partial") + " refund."
        }
      },
      function(err, refundedTransactionId) {
        if (!err) {
          // Update original transaction.
          var updatedSummary = transactionToRefund.summary;
          updatedSummary.refunded = refundedTransactionId;

          if (updatedSummary.comment) {
            updatedSummarycomment += "<br />";
          }
          updatedSummary.comment +=
            (Number(transactionToRefund.summary.totals.money).toFixed(2) ==
            Number(refundAmount).toFixed(2)
              ? "Completely"
              : "Partially") + " refunded.";

          updatedSummary.totals.money = Number(
            Number(transactionToRefund.summary.totals.money).toFixed(2) -
              Number(refundAmount).toFixed(2)
          ).toFixed(2);

          Transactions.update(
            {
              summary: updatedSummary
            },
            {
              where: {
                transaction_id: transactionToRefund.transaction_id
              }
            }
          ).nodeify(function(err) {
            if (err) {
              callback(err);
            } else {
              callback(null);
            }
          });
        } else {
          callback(err);
        }
      }
    );
  };
};
