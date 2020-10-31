module.exports = (FoodCollections, sequelize, DataTypes) => {
	return async (organisation_id, organisations, membersObj, startDate, endDate) => {
		try {
			let query = {
				where: {
					approved: 1,
					timestamp: { [DataTypes.Op.between]: [startDate, endDate] }
				},
				order: [["timestamp", "DESC"]]
			};

			if (organisation_id) {
				query.where.collection_organisation_id = organisation_id;
			}

			const collections = await FoodCollections.findAll(query).nodeify();

			let sanitizedCollections = [];
			for await (const collection of collections) {
            			const sanitizedCollection = await FoodCollections.sanitizeCollection(collection, organisations, membersObj);
                		sanitizedCollections.push(sanitizedCollection);
			}

			return sanitizedCollections;
		} catch (error) {
			throw error;
		}
	}
}
