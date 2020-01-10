module.exports = function(StockRecords, sequelize, DataTypes) {
  return function(item_id, condition, callback) {
    StockRecords.generateId(function(id) {
      StockRecords.findAll({
        order: [["timestamp", "DESC"]],
        where: {
          item_id: item_id,
          itemCondition: condition
        },
        raw: true
      }).nodeify(callback);
    });
  };
};
