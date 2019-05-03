/* jshint indent: 2 */

var CarbonCategories = function(sequelize, DataTypes) {
  return sequelize.define(
    "carbon_categories",
    {
      carbon_id: {
        type: DataTypes.STRING(6),
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      factors: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      active: {
        type: DataTypes.INTEGER(4),
        allowNull: false,
        defaultValue: "1"
      }
    },
    {
      tableName: "carbon_categories"
    }
  );
};

CarbonCategories.getById = function(carbon_id, callback) {
  var query = "SELECT * FROM carbon_categories WHERE carbon_id = ?";
  var inserts = [carbon_id];
  var sql = mysql.format(query, inserts);

  CarbonCategories.findOne({ where: { carbon_id: carbon_id } })
    .then(function(category) {
      if (category[0]) {
        category = category[0];
        category.factors = JSON.parse(category.factors);
        callback(err, category);
      } else {
        callback("No category", null);
      }
    })
    .catch(function(err) {
      callback(err, null);
    });
};

CarbonCategories.getAll = function(callback) {
  CarbonCategories.findAll({ order: [["name", "ASC"]] })
    .then(function(categories) {
      categoriesObj = {};
      async.each(
        categories,
        function(category, callback) {
          category.factors = JSON.parse(category.factors);
          categoriesObj[category.carbon_id] = category;
        },
        function() {
          callback(null, categoriesObj);
        }
      );
    })
    .catch(function(err) {
      callback(err, null);
    });
};

CarbonCategories.updateCategory = function(category, callback) {
  CarbonCategories.update(
    { factors: category.factors },
    { where: { carbon_id: category.carbon_id } }
  )
    .then(function() {
      callback(null);
    })
    .catch(function(err) {
      callback(err);
    });
};

module.exports = CarbonCategories;
