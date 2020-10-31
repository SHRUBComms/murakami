module.exports = (StockCategories) => {
  return async (category) => {
    return StockCategories.update(
      {
        carbon_id: category.carbon_id,
        name: category.name,
        value: category.value,
        conditions: category.conditions || [],
        weight: category.weight || 0,
        member_discount: category.member_discount || null,
        allowTokens: category.allowTokens,
        stockControl: category.stockControl,
        stockInfo: category.stockInfo || {}
      },
      { where: { item_id: category.item_id } }
    )
  };
};
