module.exports = function(CarbonCategories, sequelize, DataTypes) {
  return function(category, callback) {
    CarbonCategories.update(
      { factors: category.factors },
      { where: { carbon_id: category.carbon_id } }
    ).nodeify(function(err) {
      callback(err);
    });
  };
};
