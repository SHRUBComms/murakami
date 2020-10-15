module.exports = (FoodCollectionsKeys, sequelize, DataTypes) => {
	return async (foodCollectionKey) => {
		try {
			const newKey = await FoodCollectionsKeys.generateKey();
			if(!newKey) {
				throw "Key not returned by FoodCollectionsKeys.generateKey";
			}

      			return FoodCollectionsKeys.create({ key: newKey, member_id: foodCollectionKey.member_id, organisations: foodCollectionKey.organisations, last_updated: new Date(), active: 1 });

		} catch(error) {
			throw error;
		}
    	};
};
