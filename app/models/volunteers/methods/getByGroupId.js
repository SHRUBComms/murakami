var async = require("async");
var moment = require("moment");
moment.locale("en-gb");
var Helpers = require(process.env.CWD + "/app/configs/helpful_functions");

module.exports = function(Volunteers, sequelize, DataTypes) {
  return function(group_id, user, callback) {
    var working_groups = user.working_groups;
    var volunteers = [];
    var query = `SELECT * FROM volunteer_info volunteers
    RIGHT JOIN members ON volunteers.member_id = members.member_id
    LEFT JOIN (SELECT member_id hours_member_id, MAX(date) lastVolunteered FROM volunteer_hours GROUP BY member_id) hours ON members.member_id=hours.hours_member_id
    LEFT JOIN (SELECT member_id checkins_member_id, checkin_id, MAX(timestamp) lastCheckin  FROM volunteer_checkins GROUP BY member_id, checkin_id) checkins ON members.member_id=checkins.checkins_member_id
    ORDER BY lastVolunteered ASC`;

    sequelize.query(query).nodeify(function(err, returnedVolunteers) {
      Volunteers.sanitizeVolunteer(returnedVolunteers[0], user, function(
        sanitizedVolunteers
      ) {
        async.eachOf(
          sanitizedVolunteers,
          function(volunteer, i, callback) {
            if (volunteer) {
              if (group_id == "inactive") {
                if (!volunteer.active) {
                  volunteers.push(volunteer);
                }
              } else if (group_id) {
                if (volunteer.working_groups.includes(group_id) == true) {
                  volunteers.push(volunteer);
                }
              } else {
                if (volunteer.active) {
                  volunteers.push(volunteer);
                }
              }
            }
            callback();
          },
          function() {
            callback(err, volunteers);
          }
        );
      });
    });
  };
};
