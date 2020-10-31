module.exports = (CarbonCategories, sequelize, DataTypes) => {
	return async () => {
		try {
    			const categories = await CarbonCategories.findAll({ order: [["name", "ASC"]] });
			return categories.reduce((obj, item) => Object.assign(obj, { [item.carbon_id]: item }), {});
		} catch (error) {
			throw error;
		}
	}
}
