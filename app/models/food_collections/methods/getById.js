module.exports = function(FoodCollections, sequelize, DataTypes) {
  return function(transaction_id, callback) {
    FoodCollections.findOne({ transaction_id: transaction_id }).nodeify(
      function(err, collections) {
        if (collection[0]) {
          callback(null, collection[0]);
        } else {
          callback(null, null);
        }
      }
    );
  };
};
