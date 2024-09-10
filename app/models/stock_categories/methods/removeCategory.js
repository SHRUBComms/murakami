module.exports = function (StockCategories, sequelize, DataTypes) {
  return function (item_id, callback) {
    const query = "UPDATE stock_categories SET active = 0 WHERE item_id = ? OR parent = ?";
    const inserts = [item_id, item_id];
    StockCategories.update(
      { active: 0 },
      { where: { [DataTypes.Op.or]: { item_id: item_id, parent: item_id } } }
    ).nodeify(callback);
  };
};
