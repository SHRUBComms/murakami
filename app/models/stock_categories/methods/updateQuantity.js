module.exports = function(StockCategories, sequelize, DataTypes) {
  return function(item_id, stockInfo, callback) {
    StockCategories.update(
      {
        stockInfo: stockInfo
      },
      { where: { item_id: item_id } }
    ).nodeify(callback);
  };
};
