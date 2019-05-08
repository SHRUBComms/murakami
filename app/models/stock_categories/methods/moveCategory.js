module.exports = function(StockCategories, sequelize, DataTypes) {
  return function(item_id, newParent, callback) {
    StockCategories.update({ parent: newParent }, { item_id: item_id }).nodeify(
      callback
    );
  };
};
