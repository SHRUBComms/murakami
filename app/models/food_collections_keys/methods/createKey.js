module.exports = (FoodCollectionsKeys) => {
  return async (foodCollectionKey) => {
    const newKey = await FoodCollectionsKeys.generateKey();
    if (!newKey) {
      throw "Key not returned by FoodCollectionsKeys.generateKey";
    }

    await FoodCollectionsKeys.create({
      key: newKey,
      member_id: foodCollectionKey.member_id,
      organisations: foodCollectionKey.organisations,
      last_updated: new Date(),
      active: 1,
    });
    return newKey;
  };
};
