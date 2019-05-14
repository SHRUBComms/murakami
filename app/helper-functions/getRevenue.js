module.exports = function(transaction) {
  if (
    !isNaN(transaction.summary.totals.money) &&
    transaction.summary.totals.money > 0
  ) {
    revenue.total += +transaction.summary.totals.money;

    if (transaction.summary.paymentMethod == "cash") {
      revenue.breakdown.cash += +transaction.summary.totals.money;
    } else if (transaction.summary.paymentMethod == "card") {
      revenue.breakdown.card += +transaction.summary.totals.money;
    }
  }
};
