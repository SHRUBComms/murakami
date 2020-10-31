module.exports = (StockCategories) => {
  return async (item_id) => {
    return StockCategories.findOne({ where: { item_id: item_id } });
  };
};
