module.exports = function(FoodCollectionsKeys, sequelize, DataTypes) {
  return function(foodCollectionKey, callback) {
    FoodCollectionsKeys.generateKey(function(newKey) {
      FoodCollectionsKeys.create({
        key: newKey,
        member_id: foodCollectionKey.member_id,
        organisations: foodCollectionKey.organisations,
        last_updated: new Date(),
        active: 1
      }).nodeify(function(err) {
        callback(err, newKey);
      });
    });
  };
};
