module.exports = (StockRecords, sequelize, DataTypes) => {
  return async (till_id, startDate, endDate) => {
    return StockRecords.findAll({
      where: {
        till_id: till_id,
        timestamp: { [DataTypes.Op.between]: [startDate, endDate] },
      },
      order: [["timestamp", "DESC"]],
    });
  };
};
