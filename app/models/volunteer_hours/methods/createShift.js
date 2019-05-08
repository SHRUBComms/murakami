module.exports = function(VolunteerHours, sequelize, DataTypes) {
  return function(shift, callback) {
    var dt = new Date();
    VolunteerHours.generateId(function(shift_id) {
      VolunteerHours.create({
        shift_id: shift_id,
        member_id: shift.member_id,
        date: new Date(),
        duration_as_decimal: shift.duration,
        working_group: shift.working_group,
        note: shift.note || null,
        approved: shift.approved
      }).nodeify(function(err) {
        callback(err, shift_id);
      });
    });
  };
};
