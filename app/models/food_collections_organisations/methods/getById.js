module.exports = (FoodCollectionsOrganisations, sequelize, DataTypes) => {
	return async (organisation_id) => {
		try {
			const query = `SELECT * FROM food_collections_organisations
					LEFT JOIN (
						SELECT collection_organisation_id AS organisation_id, MAX(timestamp) AS lastCollection FROM food_collections GROUP BY organisation_id
					)
					collections ON food_collections_organisations.organisation_id=collections.organisation_id
					WHERE food_collections_organisations.organisation_id = ?`;

			const organisation = await sequelize.query(query, { replacements: [organisation_id] })
			organisation[0][0].organisation_id = organisation_id;
			return organisation[0][0];
		} catch (error) {
			throw error;
		}
	}
}
