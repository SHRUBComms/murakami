var con = require("./index");
var mysql = require("mysql");
var async = require("async");

var rootDir = process.env.CWD;

var Helpers = require(rootDir + "/app/configs/helpful_functions");

var WorkingGroups = {};

WorkingGroups.getAll = function(callback) {
  var query = "SELECT * FROM working_groups";
  con.query(query, function(err, working_groups_raw) {
    working_groups = {};
    async.each(
      working_groups_raw,
      function(group, callback) {
        working_groups[group.group_id] = group;

        if (group.parent) {
          try {
            working_groups[group.parent].children.push(group.group_id);
          } catch (err) {
            working_groups[group.parent].children = [group.group_id];
          }
        }

        callback();
      },
      function() {
        callback(err, working_groups, working_groups_raw);
      }
    );
  });
};

WorkingGroups.addWorkingGroup = function(group, callback) {
  var query =
    "INSERT INTO working_groups (group_id, prefix, name, parent, welcomeMessage) VALUES (?,?,?,?,?)";
  Helpers.generateGroupId(group.parent, function(id) {
    var inserts = [
      id,
      group.prefix,
      group.name,
      group.parent,
      group.welcomeMessage
    ];
    var sql = mysql.format(query, inserts);

    con.query(sql, function(err) {
      callback(err, id);
    });
  });
};

WorkingGroups.updateGroup = function(group, callback) {
  var query =
    "UPDATE working_groups SET prefix = ?, name = ?, parent = ?, welcomeMessage = ? WHERE group_id = ?";
  var inserts = [
    group.prefix,
    group.name,
    group.parent,
    group.welcomeMessage,
    group.group_id
  ];
  var sql = mysql.format(query, inserts);
  con.query(sql, callback);
};

WorkingGroups.getById = function(group_id, callback) {
  var query = "SELECT * FROM working_groups WHERE group_id = ?";
  var inserts = [group_id];
  var sql = mysql.format(query, inserts);
  con.query(sql, callback);
};

module.exports = WorkingGroups;
