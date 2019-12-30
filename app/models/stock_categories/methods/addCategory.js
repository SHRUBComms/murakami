module.exports = function(StockCategories, sequelize, DataTypes) {
  return function(category, callback) {
    StockCategories.generateId(function(id) {
      StockCategories.create({
        item_id: category.id || id,
        till_id: category.till_id,
        group_id: category.group_id,
        carbon_id: category.carbon_id,
        name: category.name,
        value: category.value,
        conditions: category.conditions || [],
        weight: category.weight || 0,
        member_discount: category.member_discount || null,
        allowTokens: category.allowTokens,
        stockControl: category.stockControl,
        stockInfo: category.stockInfo || {},
        parent: category.parent
      }).nodeify(function(err) {
        callback(err, id);
      });
    });
  };
};
