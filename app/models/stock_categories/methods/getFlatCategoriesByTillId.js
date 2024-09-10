module.exports = function (StockCategories, sequelize, DataTypes) {
  return function (till_id, callback) {
    StockCategories.findAll({
      where: { [DataTypes.Op.or]: [{ till_id: till_id }, { till_id: null }] },
      raw: true,
    }).nodeify(callback);
  };
};
