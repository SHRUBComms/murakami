var async = require("async");
var Helpers = require(process.env.CWD + "/app/helper-functions/root");

module.exports = function(StockCategories, sequelize, DataTypes) {
  return function(format, callback) {
    StockCategories.findAll({}).nodeify(function(err, categories) {
      if (err) {
        callback(null);
      } else {
        if (format == "tree") {
          Helpers.treeify(categories, function(tree) {
            callback(err, tree);
          });
        } else if (format == "kv") {
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
        } else {
          callback(err, categories);
        }
      }
    });
  };
};
