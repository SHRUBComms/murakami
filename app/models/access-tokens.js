var con = require('./index');
var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');

var Helpers = require("../configs/helpful_functions");
var Settings = require("./settings");
var Attempts = require("./attempts");
var Members = require("./members");

var AccessTokens = {}

AccessTokens.add = function(page, callback){
  var query = "INSERT INTO access_tokens (token, page, date, used) VALUES (?,?,?,0)";
  Helpers.uniqueBase64Id(50, 'access_tokens', 'token', function(token){
    var dt = new Date();
    var inserts = [token, page, new Date(dt.setMonth(dt.getMonth()))]
    var sql = mysql.format(query, inserts)
    con.query(sql, function(err){
      AccessTokens.getById(token, callback)
    });
  });
}

AccessTokens.get = function(token, page, callback){
  var query = "SELECT * FROM access_tokens WHERE page = ? AND token = ? AND date >= DATE_SUB(NOW(), INTERVAL 1 DAY) AND used = 0"
  var dt = new Date();
  var inserts = [page, token, new Date(dt.setMonth(dt.getMonth()))]
  var sql = mysql.format(query, inserts)

  con.query(sql, function(err, output){
    if(output.length == 1){
      callback(true);
    } else {
      callback(false);
    }
  });
}

AccessTokens.getById = function(token, callback){
  var query = "SELECT * FROM access_tokens WHERE token = ? AND date >= DATE_SUB(NOW(), INTERVAL 1 DAY) AND used = 0"
  var dt = new Date();
  var inserts = [token, new Date(dt.setMonth(dt.getMonth()))]
  var sql = mysql.format(query, inserts)

  con.query(sql, callback);
}

AccessTokens.markAsUsed = function(token, callback){
  var query = "UPDATE access_tokens SET used = 1 WHERE token = ?";
  var inserts = [token];
  var sql = mysql.format(query, inserts)
  con.query(sql, callback)
}

module.exports = AccessTokens;
