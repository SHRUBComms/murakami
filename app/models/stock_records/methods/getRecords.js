module.exports = (StockRecords) => {
  return async (item_id, condition) => {
    return StockRecords.findAll({
      order: [["timestamp", "DESC"]],
      where: {
        item_id: item_id,
        itemCondition: condition
      },
      raw: true
    });
  };
};
