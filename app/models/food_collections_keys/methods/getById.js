module.exports = (FoodCollectionsKeys, sequelize, DataTypes) => {
	return async (key) => {
    		return FoodCollectionsKeys.findOne({ where: { key: key }, raw: true });
  	}
}
