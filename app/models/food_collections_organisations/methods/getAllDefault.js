module.exports = (FoodCollectionsOrganisations, sequelize, DataTypes) => {
	return async () => {
		try {
			const defaultOrganisations = await FoodCollectionsOrganisations.findAll({
				where: { default: 1 },
				raw: true
			});

    			return defaultOrganisations.reduce((obj, item) => Object.assign(obj, { [item.organisation_id]: item }), {});
		} catch (error) {
			throw error;
		}
	}
}
