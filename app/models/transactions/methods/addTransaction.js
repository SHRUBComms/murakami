module.exports = (Transactions) => {
  return async (transaction) => {
    const id = await Transactions.generateId();
    transaction.transaction_id = id;

    await Transactions.create({
      transaction_id: transaction.transaction_id,
      till_id: transaction.till_id,
      user_id: transaction.user_id,
      member_id: transaction.member_id,
      date: transaction.date,
      summary: transaction.summary
    });

    return id;
  };
};
