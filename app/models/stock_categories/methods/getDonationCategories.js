const async = require("async");

module.exports = function (StockCategories, sequelize, DataTypes) {
  return function (callback) {
    con
      .query({ where: { name: { [DataTypes.Op.like]: "%donation%" } } })
      .nodeify(function (err, donationCategories) {
        const donationCategoriesObj = {};
        if (donationCategories) {
          async.each(
            donationCategories,
            function (category, callback) {
              donationCategoriesObj[category.item_id] = category;
              callback();
            },
            function () {
              callback(err, donationCategoriesObj);
            }
          );
        } else {
          callback(err, donationCategoriesObj);
        }
      });
  };
};
