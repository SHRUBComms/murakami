module.exports = (Members, sequelize, DataType) => {
	return async (id, user) => {
		try {
			const query = `SELECT * FROM members
					LEFT JOIN (SELECT member_id volunteer_id, gdpr, roles, assignedCoordinators
					FROM volunteer_info GROUP BY member_id) volInfo ON volInfo.volunteer_id=members.member_id
					WHERE members.member_id = ?`;

			const member = await sequelize.query(query, { replacements: [id] });
			return Members.sanitizeMember(member[0][0], user);
		} catch (error) {
			throw error;
		}
	}
}
