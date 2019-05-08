var async = require("async");
module.exports = function(VolunteerHours, sequelize, DataTypes) {
  return function(group_id, startDate, endDate, members, callback) {
    VolunteerHours.findAll({
      where: {
        working_group: group_id,
        date: { [DataTypes.Op.between]: [startDate, endDate] }
      }
    }).nodeify(function(err, shifts) {
      async.each(
        shifts,
        function(shift, callback) {
          if (members[shift.member_id]) {
            shift.member =
              members[shift.member_id].first_name +
              " " +
              members[shift.member_id].last_name;
          }
          callback();
        },
        function() {
          callback(err, shifts);
        }
      );
    });
  };
};
