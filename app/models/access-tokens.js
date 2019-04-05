var con = require("./index");
var mysql = require("mysql");

var Helpers = require("../configs/helpful_functions");

var AccessTokens = {};

AccessTokens.getById = function(token, callback) {
  var query =
    "SELECT * FROM access_tokens WHERE token = ? AND timestamp >= DATE_SUB(NOW(), INTERVAL 1 DAY) AND used = 0";
  var dt = new Date();
  var inserts = [token, new Date()];
  var sql = mysql.format(query, inserts);

  con.query(sql, function(err, invite) {
    try {
      invite = invite[0];
      invite.details = JSON.parse(invite.details);
    } catch (err) {
      invite = {};
    }

    callback(err, invite);
  });
};

AccessTokens.createToken = function(details, callback) {
  var query =
    "INSERT INTO access_tokens (token, timestamp, details, used) VALUES (?,?,?,?)";

  Helpers.uniqueBase64Id(25, "access_tokens", "token", function(token) {
    var inserts = [token, new Date(), JSON.stringify(details), 0];
    
    var sql = mysql.format(query, inserts);
    con.query(sql, function(err) {
      
      if (!err) {
        callback(null, token);
      } else {
        callback(err, null);
      }
    });
  });
};

AccessTokens.markAsUsed = function(token, callback) {
  var query = "UPDATE access_tokens SET used = 1 WHERE token = ?";
  var inserts = [token];
  var sql = mysql.format(query, inserts);
  con.query(sql, callback);
};

module.exports = AccessTokens;
