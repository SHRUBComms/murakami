module.exports = (CarbonCategories, sequelize, DataTypes) => {
	return async (category) => {
    		return CarbonCategories.update({ factors: category.factors }, { where: { carbon_id: category.carbon_id } });
	}
}
