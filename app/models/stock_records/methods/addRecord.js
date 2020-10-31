module.exports = (StockRecords, sequelize, DataTypes) => {
  return async (record) => {
    const id = await StockRecords.generateId();
    await StockRecords.create({
        action_id: id,
        item_id: record.item_id,
        till_id: record.till_id,
        itemCondition: record.condition,
        user_id: record.user_id,
        timestamp: new Date(),
        actionInfo: record.actionInfo
    });
    return id;
  }
};
