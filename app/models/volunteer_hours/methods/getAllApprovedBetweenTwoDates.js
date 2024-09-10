module.exports = (VolunteerHours, sequelize, DataTypes) => {
  return async (startDate, endDate) => {
    return VolunteerHours.findAll({
      where: {
        approved: 1,
        date: { [DataTypes.Op.between]: [startDate, endDate] },
      },
    });
  };
};
