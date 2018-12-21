var con = require("./index");
var mysql = require("mysql");

var Notifications = {};

Notifications.getAll = function(user_id, callback) {
  var query = "SELECT * FROM notifications WHERE user_id = ?";
  var inserts = [user_id];
  var sql = mysql.format(query, inserts);
  con.query(sql, callback);
};

Notifications.getNew = function(user_id, callback) {
  var query = "SELECT * FROM notifications WHERE user_id = ? AND readState = 0";
  var inserts = [user_id];
  var sql = mysql.format(query, inserts);
  con.query(sql, callback);
};

module.exports = Notifications;
