module.exports = function(FoodCollections, sequelize, DataTypes) {
  return function(transaction_id, callback) {
    FoodCollections.findOne({
      where: { transaction_id: transaction_id }
    }).nodeify(function(err, collection) {
      callback(err, collection);
    });
  };
};
