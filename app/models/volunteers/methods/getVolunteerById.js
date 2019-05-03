module.exports = function(Volunteers, sequelize, DataTypes) {
  return function(member_id, user, callback) {
    var query = `SELECT * FROM volunteer_info volunteers RIGHT JOIN members ON volunteers.member_id = members.member_id LEFT JOIN (SELECT member_id hours_member_id, MAX(date) lastVolunteered FROM volunteer_hours GROUP BY member_id) hours ON members.member_id=hours.hours_member_id LEFT JOIN (SELECT member_id checkins_member_id, checkin_id, MAX(timestamp) lastCheckin FROM volunteer_checkins GROUP BY member_id, checkin_id) checkins ON members.member_id=checkins.checkins_member_id WHERE volunteers.member_id = ?`;
    var inserts = [member_id];
    var sql = mysql.format(query, inserts);
    con.query(sql, function(err, volInfo) {
      if (volInfo[0] && !err) {
        Volunteers.sanitizeVolunteer([volInfo[0]], user, function(
          volInfoClean
        ) {
          callback(null, volInfoClean[0]);
        });
      } else {
        callback(err, null);
      }
    });
  };
};
