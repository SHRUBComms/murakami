module.exports = (Transactions, sequelize, DataTypes) => {
  return async (till_id, transaction_id) => {
    return Transactions.findOne({ where: { till_id: till_id, [DataTypes.Op.or]: [ { transaction_id: transaction_id }, { summary: { sumupId: transaction_id } } ] }});
  }
}
