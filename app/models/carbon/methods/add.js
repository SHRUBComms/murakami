module.exports = (Carbon, sequelize, DataTypes) => {
  return async (transaction) => {
    const transactionId = await Carbon.generateId();

    return Carbon.create({
      transaction_id: transactionId,
      fx_transaction_id: transaction.fx_transaction_id,
      member_id: transaction.member_id,
      user_id: transaction.user_id,
      group_id: transaction.group_id,
      trans_object: transaction.trans_object,
      method: transaction.method,
      trans_date: new Date(),
    });
  };
};
