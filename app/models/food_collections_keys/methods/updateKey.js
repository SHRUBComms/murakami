module.exports = (FoodCollectionsKeys, sequelize, DataTypes) => {
  return async (foodCollectionKey) => {
    return FoodCollectionsKeys.update(
      {
        key: foodCollectionKey.key,
        member_id: foodCollectionKey.member_id,
        organisations: foodCollectionKey.organisations,
        last_updated: new Date(),
        active: foodCollectionKey.active
      },
      { where: { key: foodCollectionKey.key } }
    )
  };
};
