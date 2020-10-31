module.exports = (Transactions) => {
  return async (transaction_id) => {
    return Transactions.findOne({
      where: { transaction_id: transaction_id },
      raw: true
    })
  };
};
