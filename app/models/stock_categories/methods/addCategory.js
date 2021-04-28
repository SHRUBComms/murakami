module.exports = (StockCategories) => {
  return async (category) => {
    const id = await StockCategories.generateId();
    
    await StockCategories.create({
        item_id: category.id || id,
        till_id: category.till_id,
        group_id: category.group_id,
        discount: category.discount || 0,
        carbon_id: category.carbon_id,
        name: category.name,
        value: category.value,
        conditions: category.conditions || [],
        weight: category.weight || 0,
        member_discount: category.member_discount || 0,
        allowTokens: category.allowTokens,
        stockControl: category.stockControl,
        stockInfo: category.stockInfo || {},
        parent: category.parent
    });
    
    return id;
  };
};
