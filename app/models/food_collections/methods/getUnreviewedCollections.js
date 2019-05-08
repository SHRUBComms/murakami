module.exports = function(FoodCollections, sequelize, DataTypes) {
  return function(callback) {
    FoodCollections.findAll({ where: { approved: null } }).nodeify(function(
      err,
      collections
    ) {
      callback(err, collections);
    });
  };
};
