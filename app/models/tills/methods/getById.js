module.exports = (Tills, sequelize, DataTypes) => {
	return async (till_id) => {
		try {
			const query = `SELECT tills.*, working_groups.name AS group_name FROM tills
				JOIN working_groups ON tills.group_id = working_groups.group_id AND tills.till_id = ?`;
			const inserts = [till_id];

			const till = await sequelize.query(query, { replacements: inserts })

			return till[0][0];
		} catch(error) {
			throw error;
		}
	}
}
