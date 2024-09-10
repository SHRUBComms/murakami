module.exports = function (Volunteers, sequelize, DataTypes) {
  return async (member_id, user, callback) => {
    const query = `SELECT * FROM volunteer_info volunteers
				RIGHT JOIN members ON volunteers.member_id = members.member_id
				LEFT JOIN (SELECT member_id hours_member_id, MAX(date) lastVolunteered FROM volunteer_hours GROUP BY member_id) hours ON members.member_id=hours.hours_member_id
				LEFT JOIN (SELECT member_id checkins_member_id, checkin_id, MAX(timestamp) lastCheckin FROM volunteer_checkins GROUP BY member_id, checkin_id) checkins ON members.member_id=checkins.checkins_member_id
				WHERE volunteers.member_id = ?`;
    try {
      const volunteer = await sequelize.query(query, { replacements: [member_id] });
      if (!volunteer[0][0]) {
        return null;
      }

      const sanitizedVolunteer = await Volunteers.sanitizeVolunteer([volunteer[0][0]], user);

      if (!sanitizedVolunteer) {
        return null;
      }

      return sanitizedVolunteer[0];
    } catch (error) {
      throw error;
    }
  };
};
