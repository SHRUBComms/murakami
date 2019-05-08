module.exports = function(StockCategories, sequelize, DataTypes) {
  return function(category, callback) {
    StockCategories.update(
      {
        carbon_id: category.carbon_id,
        name: category.name,
        value: category.value,
        needsCondition: category.needsCondition,
        weight: category.weight || 0,
        member_discount: category.member_discount || null,
        allowTokens: category.allowTokens
      },
      { where: { item_id: category.item_id } }
    ).nodeify(callback);
  };
};
