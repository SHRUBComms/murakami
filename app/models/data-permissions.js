var con = require("./index");
var mysql = require("mysql");
var async = require("async");
var moment = require("moment");
moment.locale("en-gb");

var rootDir = process.env.CWD;

var Helpers = require(rootDir + "/app/configs/helpful_functions");

var Volunteers = require(rootDir + "/app/models/volunteers");
var Settings = require(rootDir + "/app/models/settings");

var DataPermissions = {};

DataPermissions.getAll = function(callback) {
  var query = "SELECT * FROM data_permissions ORDER BY class ASC";
  con.query(query, function(err, dataPermissions) {
    var formattedPermissions = {};
    async.each(
      dataPermissions,
      function(classPermission, callback) {
        formattedPermissions[classPermission.class] = JSON.parse(
          classPermission.permissions
        );
        callback();
      },
      function() {
        callback(err, formattedPermissions);
      }
    );
  });
};

DataPermissions.update = function(userClass, permissions, callback) {
  var query = "UPDATE data_permissions SET permissions = ? WHERE class = ?";
  var inserts = [JSON.stringify(permissions), userClass];
  var sql = mysql.format(query, inserts);
  con.query(sql, callback);
};

module.exports = DataPermissions;
