module.exports = (FoodCollections, sequelize, DataTypes) => {
  return async (organisation_id, organisations, membersObj, startDate, endDate) => {
    try {
      const query = {
        where: {
          approved: 1,
          timestamp: { [DataTypes.Op.between]: [startDate, endDate] },
        },
        order: [["timestamp", "DESC"]],
      };

      const collections = await FoodCollections.findAll(query);
      const sanitizedCollections = [];
      for await (const collection of collections) {
        if (collection.destination_organisations.includes(organisation_id) || !organisation_id) {
          const sanitizedCollection = await FoodCollections.sanitizeCollection(
            collection,
            organisations,
            membersObj
          );
          sanitizedCollections.push(sanitizedCollection);
        }
      }

      return sanitizedCollections;
    } catch (error) {
      throw error;
    }
  };
};
