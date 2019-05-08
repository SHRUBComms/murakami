module.exports = function(StockCategories, sequelize, DataTypes) {
  return function(item_id, callback) {
    StockCategories.findOne({ where: { item_id: item_id } }).nodeify(callback);
  };
};
