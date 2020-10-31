const moment = require("moment");
moment.locale("en-gb");

const rootDir = process.env.CWD;

const Helpers = require(rootDir + "/app/helper-functions/root");

module.exports = (Volunteers, sequelize, DataTypes) => {
	return async (group_id, user) => {
		try {
			const working_groups = user.working_groups;
			let volunteers = [];
			let volunteersObj = {};

			const query = `SELECT * FROM volunteer_info volunteers
					RIGHT JOIN members ON volunteers.member_id = members.member_id
					LEFT JOIN (SELECT member_id hours_member_id, MAX(date) lastVolunteered FROM volunteer_hours GROUP BY member_id) hours ON members.member_id=hours.hours_member_id
					LEFT JOIN (SELECT member_id checkins_member_id, MAX(timestamp) lastCheckin  FROM volunteer_checkins GROUP BY member_id) checkins ON members.member_id=checkins.checkins_member_id
					ORDER BY lastVolunteered ASC`;

			const returnedVolunteers = await sequelize.query(query);
			const sanitizedVolunteers = await Volunteers.sanitizeVolunteer(returnedVolunteers[0], user);

			for await (const volunteer of sanitizedVolunteers) {
				if (volunteer) {
					if (group_id == "inactive") {
						if (!volunteer.active) {
							volunteers.push(volunteer);
							volunteersObj[volunteer.member_id] = volunteer;
						}
					} else if (group_id == "my-volunteers") {
						if (volunteer.assignedCoordinators.includes(user.id)) {
							volunteers.push(volunteer);
							volunteersObj[volunteer.member_id] = volunteer;
						}
					} else if (group_id !== null) {
						if (volunteer.working_groups.includes(group_id) == true) {
							volunteers.push(volunteer);
							volunteersObj[volunteer.member_id] = volunteer;
						}
					} else {
						volunteers.push(volunteer);
						volunteersObj[volunteer.member_id] = volunteer;
					}
				}
			}

			return { volunteers, volunteersObj };
		} catch (error) {
			throw error;
		}
	}
}
