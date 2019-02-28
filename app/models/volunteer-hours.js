var con = require("./index");
var mysql = require("mysql");
var async = require("async");

var rootDir = process.env.CWD;

var Helpers = require(rootDir + "/app/configs/helpful_functions");

var VolunteerHours = {};

VolunteerHours.getAll = function(callback) {
  var query = "SELECT * FROM volunteer_hours";

  con.query(query, callback);
};

VolunteerHours.getAllUnreviewedShifts = function(callback) {
  var query =
    "SELECT * FROM volunteer_hours WHERE approved IS NULL ORDER BY date ASC";

  con.query(query, callback);
};

VolunteerHours.getUnreviewedShiftsByGroupId = function(group_id, callback) {
  var query =
    "SELECT * FROM volunteer_hours WHERE working_group = ? AND approved IS NULL";
  var inserts = [group_id];
  var sql = mysql.format(query, inserts);

  con.query(sql, callback);
};

VolunteerHours.getShiftById = function(shift_id, callback) {
  var query = "SELECT * FROM volunteer_hours WHERE shift_id = ?";
  var inserts = [shift_id];

  var sql = mysql.format(query, inserts);
  con.query(sql, callback);
};

VolunteerHours.approveShift = function(shift_id, callback) {
  var query = "UPDATE volunteer_hours SET approved = 1 WHERE shift_id = ?";
  var inserts = [shift_id];

  var sql = mysql.format(query, inserts);
  con.query(sql, callback);
};

VolunteerHours.denyShift = function(shift_id, callback) {
  var query = "UPDATE volunteer_hours SET approved = 0 WHERE shift_id = ?";
  var inserts = [shift_id];

  var sql = mysql.format(query, inserts);
  con.query(sql, callback);
};

VolunteerHours.createShift = function(shift, callback) {
  var dt = new Date();
  Helpers.uniqueIntId(11, "volunteer_hours", "shift_id", function(id) {
    var query =
      "INSERT INTO volunteer_hours (shift_id, member_id, date, duration_as_decimal, working_group, note, approved) VALUES (?,?,?,?,?,?,?)";
    var inserts = [
      id,
      shift.member_id,
      new Date(dt.setMonth(dt.getMonth())),
      shift.duration,
      shift.working_group,
      shift.note || null,
      shift.approved
    ];
    var sql = mysql.format(query, inserts);

    con.query(sql, callback);
  });
};

VolunteerHours.getAllApprovedByGroupId = function(group_id, callback) {
  var query =
    "SELECT * FROM volunteer_hours WHERE working_group = ? AND approved = 1";
  var inserts = [group_id];
  var sql = mysql.format(query, inserts);

  con.query(sql, callback);
};

VolunteerHours.getHoursBetweenTwoDatesByWorkingGroup = function(
  group_id,
  startDate,
  endDate,
  callback
) {
  var Members = require(rootDir + "/app/models/members");
  var query =
    "SELECT * FROM volunteer_hours WHERE working_group = ? AND approved = 1 AND date >= DATE(?) AND date <= DATE(?) ORDER BY date DESC";
  var inserts = [group_id, startDate, endDate];
  var sql = mysql.format(query, inserts);
  con.query(sql, function(err, shifts) {
    Members.getAll(function(err, membersArray, members) {
      async.each(
        shifts,
        function(shift, callback) {
          if (members[shift.member_id]) {
            shift.member =
              members[shift.member_id].first_name +
              " " +
              members[shift.member_id].last_name;
          }
          callback();
        },
        function() {
          callback(err, shifts);
        }
      );
    });
  });
};

module.exports = VolunteerHours;
