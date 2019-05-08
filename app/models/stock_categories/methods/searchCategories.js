module.exports = function(StockCategories, sequelize, DataTypes) {
  return function(term, till_id, callback) {
    var query =
      "SELECT * FROM stock_categories WHERE till_id = ? AND name LIKE ? AND active = 1 ORDER BY name ASC LIMIT 5";
    var inserts = [till_id, "%" + term + "%"];
    StockCategories.findAll({
      where: {
        till_id: till_id,
        name: { [DataTypes.Op.like]: "%" + term + "%" }
      },
      order: [["name", "ASC"]],
      limit: 5
    }).nodeify(callback);
  };
};
