const async = require("async");

module.exports = function (StockCategories, sequelize, DataTypes) {
  return function (parent, callback) {
    StockCategories.findAll({ where: { parent: parent } }).nodeify(function (err, categories) {
      const formattedCategories = {};
      async.each(
        categories,
        function (category, callback) {
          formattedCategories[category.item_id] = category;
          callback();
        },
        function () {
          callback(err, formattedCategories);
        }
      );
    });
  };
};
