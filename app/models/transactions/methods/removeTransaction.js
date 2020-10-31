module.exports = (Transactions) => {
  return async (transaction_id) => {
    return Transactions.destroy({where: {transaction_id: transaction_id}});
  };
};
