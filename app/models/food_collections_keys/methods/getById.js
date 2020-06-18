module.exports = function(FoodCollectionsKeys, sequelize, DataTypes) {
  return function(key, callback) {
    FoodCollectionsKeys.findOne({ where: { key: key }, raw: true }).nodeify(
      callback
    );
  };
};
