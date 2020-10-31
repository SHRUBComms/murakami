module.exports = (StockCategories, sequelize, DataTypes) => {
	return async () => {
		try {
    			const categories = await StockCategories.findAll({});
    			return categories.reduce((obj, item) => Object.assign(obj, { [item.item_id]: item }), {});
		} catch (error) {
			throw error;
		}
	}
}
