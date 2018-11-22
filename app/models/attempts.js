var con = require("./index");
var mysql = require("mysql");

var Attempts = {};

Attempts.failed = function(user_id, ip_address) {
  var query =
    "INSERT INTO attempts (user_id, ip_address, outcome, login_timestamp) VALUES (?,?,?,?)";

  var dt = new Date();

  var inserts = [user_id, ip_address, 0, new Date(dt.setMonth(dt.getMonth()))];
  var sql = mysql.format(query, inserts);

  con.query(sql);
};

Attempts.passed = function(user_id, ip_address) {
  var query =
    "INSERT INTO attempts (user_id, ip_address, outcome, login_timestamp) VALUES (?,?,?,?)";

  var dt = new Date();

  var inserts = [user_id, ip_address, 1, new Date(dt.setMonth(dt.getMonth()))];
  var sql = mysql.format(query, inserts);

  con.query(sql);
};

Attempts.getLastLogin = function(user_id, callback) {
  var query =
    "SELECT login_timestamp FROM attempts WHERE user_id = ? AND outcome = 1 ORDER BY login_timestamp DESC LIMIT 1";

  var inserts = [user_id];
  var sql = mysql.format(query, inserts);

  con.query(sql, callback);
};

Attempts.getAllAttemptsThisHour = function(user_id, callback) {
  var query =
    "SELECT * FROM attempts WHERE user_id = ? AND outcome = 0 AND login_timestamp > (now() - interval 60 minute)";

  var inserts = [user_id];
  var sql = mysql.format(query, inserts);

  con.query(sql, callback);
};

module.exports = Attempts;
