module.exports = function (VolunteerHours, sequelize, DataTypes) {
  return function (callback) {
    VolunteerHours.findAll({}).nodeify(callback);
  };
};
