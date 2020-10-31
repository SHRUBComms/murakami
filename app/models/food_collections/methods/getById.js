module.exports = (FoodCollections, sequelize, DataTypes) => {
  	return async (transaction_id) => {
    		return FoodCollections.findOne({ where: { transaction_id: transaction_id } });
	}
}
