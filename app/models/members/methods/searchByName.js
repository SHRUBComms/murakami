module.exports = (Members, sequelize, DataTypes) => {
  	return async (search) => {
		try {
			const query = `SELECT * FROM members
					LEFT JOIN (SELECT member_id volunteer_id, gdpr, roles
					FROM volunteer_info GROUP BY member_id) volInfo ON volInfo.volunteer_id=members.member_id
					WHERE (CONCAT(first_name, ' ', last_name) LIKE ? OR barcode = ? OR member_id = ?) AND first_name != '[redacted]'
					ORDER BY first_name ASC LIMIT 3`;
			const inserts = ["%" + search + "%", search, search];

			const members = await sequelize.query(query, { replacements: inserts });
			return members[0];
		} catch (error) {
			throw error;
		}
	}
}
