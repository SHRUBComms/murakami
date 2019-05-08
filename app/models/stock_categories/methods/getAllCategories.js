var async = require("async");

module.exports = function(StockCategories, sequelize, DataTypes) {
  return function(callback) {
    StockCategories.findAll({}).nodeify(function(err, categories) {
      var categoriesObj = {};
      async.each(
        categories,
        function(category, callback) {
          categoriesObj[category.item_id] = category;
          callback();
        },
        function() {
          callback(err, categoriesObj);
        }
      );
    });
  };
};
