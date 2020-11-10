module.exports = (Transactions, sequelize, DataTypes) => {
  return async (startDate, endDate) => {
    return Transactions.findAll({
      where: {
        date: { [DataTypes.Op.between]: [startDate, endDate] }
      },
      order: [["date", "DESC"]]
    });
  };
};
