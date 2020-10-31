module.exports = (CarbonCategories, sequelize, DataTypes) => {
	return async (carbon_id) => {
    		return CarbonCategories.findOne({ where: { carbon_id: carbon_id } });
	}
}
