module.exports = function (VolunteerHours, sequelize, DataTypes) {
  return function (shift_id, callback) {
    VolunteerHours.findOne({
      where: { shift_id: shift_id },
    }).nodeify(function (err, shift) {
      callback(err, shift);
    });
  };
};
