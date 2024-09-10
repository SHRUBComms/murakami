module.exports = (FoodCollections, sequelize, DataTypes) => {
  return async (organisation_id, organisations, membersObj) => {
    const collections = await FoodCollections.findAll({
      where: { collection_organisation_id: organisation_id, approved: 1 },
      order: [["timestamp", "DESC"]],
    });

    const sanitizedCollections = [];
    for await (const collection of collections) {
      const sanitizedCollection = await FoodCollections.sanitizeCollection(
        collection,
        organisations,
        membersObj
      );
      sanitizedCollections.push(sanitizedCollection);
    }

    return sanitizedCollections;
  };
};
