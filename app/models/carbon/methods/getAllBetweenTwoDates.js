module.exports = (Carbon, sequelize, DataTypes) => {
  return async (startDate, endDate) => {
    return Carbon.findAll({
      where: {
        trans_date: { [DataTypes.Op.between]: [startDate, endDate] },
      },
    });
  };
};
