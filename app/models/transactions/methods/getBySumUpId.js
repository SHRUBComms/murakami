module.exports = (Transactions, sequelize, DataTypes) => {
  return async (sumupId) => {
    return Transactions.findOne({ where: { summary: { sumupId: sumupId } } });
  };
};
