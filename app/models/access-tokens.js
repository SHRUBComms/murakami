var con = require("./index");
var mysql = require("mysql");

var Helpers = require("../configs/helpful_functions");

var AccessTokens = {};

AccessTokens.getById = function(token, callback) {
  var query =
    "SELECT * FROM access_tokens WHERE token = ? AND timestamp >= DATE_SUB(NOW(), INTERVAL 1 DAY) AND used = 0";
  var dt = new Date();
  var inserts = [token, new Date(dt.setMonth(dt.getMonth()))];
  var sql = mysql.format(query, inserts);

  con.query(sql, callback);
};

AccessTokens.markAsUsed = function(token, callback) {
  var query = "UPDATE access_tokens SET used = 1 WHERE token = ?";
  var inserts = [token];
  var sql = mysql.format(query, inserts);
  con.query(sql, callback);
};

module.exports = AccessTokens;
