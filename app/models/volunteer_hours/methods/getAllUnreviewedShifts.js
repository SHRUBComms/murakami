module.exports = function(VolunteerHours, sequelize, DataTypes) {
  return function(callback) {
    VolunteerHours.findAll({
      where: { approved: null },
      order: [["date", "ASC"]]
    }).nodeify(callback);
  };
};
