const async = require("async");

module.exports = function (StockCategories, sequelize, DataTypes) {
  return function (callback) {
    StockCategories.findAll({
      raw: true,
      where: { action: { [DataTypes.Op.like]: "%MEM%" } },
    }).nodeify(function (err, membershipCategories) {
      const membershipCategoriesObj = {};
      if (membershipCategories) {
        async.each(
          membershipCategories,
          function (category, callback) {
            membershipCategoriesObj[category.item_id] = category;
            callback();
          },
          function () {
            callback(err, membershipCategoriesObj);
          }
        );
      } else {
        callback(err, membershipCategoriesObj);
      }
    });
  };
};
