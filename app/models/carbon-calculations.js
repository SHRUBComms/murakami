var con = require("./index");
var mysql = require("mysql");

var Helpers = require("../configs/helpful_functions");

var Carbon = {};

Carbon.getByMemberId = function(member_id, callback) {
  var query = "SELECT * FROM carbon WHERE member_id = ?";
  var inserts = [member_id];
  var sql = mysql.format(query, inserts);

  con.query(sql, callback);
};

Carbon.getCategoryById = function(carbon_id, callback) {
  var query = "SELECT * FROM carbon_categories WHERE carbon_id = ?";
  var inserts = [carbon_id];
  var sql = mysql.format(query, inserts);

  con.query(sql, function(err, category) {
    if (category[0]) {
      category = category[0];
      category.factors = JSON.parse(category.factors);
      callback(err, category);
    } else {
      callback("No category", null);
    }
  });
};

Carbon.getAll = function(callback) {
  var query = "SELECT * FROM carbon";
  con.query(query, callback);
};

Carbon.getAllThisYear = function(callback) {
  var query = "SELECT * FROM carbon WHERE YEAR(trans_date) = YEAR(CURDATE());";
  con.query(query, callback);
};

Carbon.getToday = function(callback) {
  var query = "SELECT * FROM carbon WHERE DATE(trans_date) = CURDATE()";
  con.query(query, callback);
};

Carbon.add = function(transaction, callback) {
  if (transaction.amount > 0) {
    var query =
      "INSERT INTO carbon (transaction_id, member_id, user_id, group_id, trans_object, method, trans_date) VALUES (?,?,?,?,?,?,?)";

    // Generate ID!
    Helpers.uniqueIntId(20, "carbon", "transaction_id", function(id) {
      transaction.transaction_id = id;

      var inserts = [
        transaction.transaction_id,
        transaction.member_id,
        transaction.user_id,
        transaction.group_id,
        transaction.trans_object,
        transaction.method,
        new Date()
      ];

      var sql = mysql.format(query, inserts);

      con.query(sql, callback);
    });
  } else {
    callback(true);
  }
};

Carbon.getCategories = function(callback) {
  var query = "SELECT * FROM carbon_categories ORDER BY name ASC";
  con.query(query, function(err, carbonCategories) {
    carbonCategoriesObj = {};
    for (let i = 0; i < carbonCategories.length; i++) {
      carbonCategories[i].factors = JSON.parse(carbonCategories[i].factors);
      carbonCategoriesObj[carbonCategories[i].carbon_id] = carbonCategories[i];
    }

    callback(err, carbonCategoriesObj);
  });
};

Carbon.updateCategory = function(category, callback) {
  var query = "UPDATE carbon_categories SET factors = ? WHERE carbon_id = ?";
  var inserts = [category.factors, category.carbon_id];
  var sql = mysql.format(query, inserts);
  con.query(sql, callback);
};

Carbon.getAllByWorkingGroup = function(group_id, callback) {
  var query = "SELECT * FROM carbon WHERE group_id = ?";
  var inserts = [group_id];
  var sql = mysql.format(query, inserts);
  con.query(sql, callback);
};

module.exports = Carbon;
