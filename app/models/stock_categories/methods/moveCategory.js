module.exports = (StockCategories) => {
  return async (item_id, newParent) => {
    return StockCategories.update({ parent: newParent }, { where: { item_id: item_id } });
  };
};
