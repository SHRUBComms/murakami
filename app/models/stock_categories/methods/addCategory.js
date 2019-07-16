module.exports = function(StockCategories, sequelize, DataTypes) {
  return function(category, callback) {
    StockCategories.generateId(function(id) {
      StockCategories.create({
        item_id: category.id || id,
        till_id: category.till_id,
        carbon_id: category.carbon_id,
        group_id: category.group_id,
        name: category.name,
        value: category.value,
        needsCondition: category.needsCondition,
        member_discount: category.member_discount || 0,
        weight: category.weight || 0,
        allowTokens: category.allowTokens,
        parent: category.parent
      }).nodeify(function(err) {
        callback(err, id);
      });
    });
  };
};
