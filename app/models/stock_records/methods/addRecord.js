module.exports = function(StockRecords, sequelize, DataTypes) {
  return function(record, callback) {
    StockRecords.generateId(function(id) {
      StockRecords.create({
        action_id: id,
        item_id: record.item_id,
        till_id: record.till_id,
        itemCondition: record.condition,
        user_id: record.user_id,
        timestamp: new Date(),
        actionInfo: record.actionInfo
      }).nodeify(function(err) {
        callback(err, id);
      });
    });
  };
};
