module.exports = (Transactions, sequelize, DataTypes) => {
  return async (till_id, startDate, endDate) => {
    return Transactions.findAll({
      where: { till_id: till_id, date: { [DataTypes.Op.between]: [startDate, endDate] } },
      order: [["date", "DESC"]],
    });
  };
};
