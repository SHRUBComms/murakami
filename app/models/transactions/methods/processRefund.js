module.exports = (Transactions) => {
  return async (refundAmount, transactionToRefund) => {
    try {
      const refundTransaction = {
        till_id: transactionToRefund.till_id,
        user_id: transactionToRefund.user_id,
        member_id: transactionToRefund.member_id || "anon",
        date: new Date(),
        summary: {
          paymentMethod: transactionToRefund.summary.paymentMethod,
          refundedTransactionId: transactionToRefund.transaction_id,
          bill: [{ value: Number(refundAmount).toFixed(2), item_id: "refund" }],
          totals: { money: refundAmount },
          comment: `${Number(transactionToRefund.summary.totals.money).toFixed(2) == Number(refundAmount).toFixed(2) ? "Complete" : "Partial"} refund."`
        }
      };
   

      const refundTransactionId = await Transactions.addTransaction(refundTransaction);
      // Update original transaction.
      let updatedSummary = transactionToRefund.summary;
      updatedSummary.refunded = refundTransactionId;

      if (updatedSummary.comment) {
        updatedSummary.comment += "<br />";
      }
      
      updatedSummary.comment += `${Number(transactionToRefund.summary.totals.money).toFixed(2) == Number(refundAmount).toFixed(2) ? "Completely" : "Partially"} refunded.`;

      updatedSummary.totals.money = Number(Number(transactionToRefund.summary.totals.money).toFixed(2) - Number(refundAmount).toFixed(2)).toFixed(2);

      await Transactions.update({ summary: updatedSummary }, { where: { transaction_id: transactionToRefund.transaction_id } });
      return null;
    } catch (error) {
      throw "Something went wrong recording this refund in Murakami - plase contact support";
    }
  }
}
