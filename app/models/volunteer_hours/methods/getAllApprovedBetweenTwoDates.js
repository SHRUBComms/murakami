module.exports = function(VolunteerHours, sequelize, DataTypes) {
  return function(startDate, endDate, callback) {
    VolunteerHours.findAll({
      where: {
        approved: 1,
        date: { [DataTypes.Op.between]: [startDate, endDate] }
      }
    }).nodeify(callback);
  };
};
