var async = require("async");

module.exports = function(CarbonCategories, sequelize, DataTypes) {
  return function(callback) {
    CarbonCategories.findAll({ order: [["name", "ASC"]] }).nodeify(function(
      err,
      categories
    ) {
      categoriesObj = {};
      async.each(
        categories,
        function(category, callback) {
          categoriesObj[category.carbon_id] = category;
          callback();
        },
        function() {
          callback(err, categoriesObj);
        }
      );
    });
  };
};
