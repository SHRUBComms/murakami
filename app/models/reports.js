var mysql = require("mysql");
var async = require("async");
var con = require("./index");

var Helpers = require("../configs/helpful_functions");

var Reports = {};

Reports.add = function(subject, report, callback) {
  var query = "INSERT INTO reports (subject, date, report) VALUES (?,?,?)";
  var inserts = [subject, new Date(), JSON.stringify(report)];
  var sql = mysql.format(query, inserts);
  con.query(sql, callback);
};

module.exports = Reports;
