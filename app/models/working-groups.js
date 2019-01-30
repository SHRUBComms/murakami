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
        callback();
      },
      function() {
        callback(err, working_groups);
      }
    );
  });
};

WorkingGroups.getAllMembersByGroup = function(group_id, callback) {
  var query =
    "SELECT * FROM members WHERE working_groups LIKE ? ORDER BY first_name ASC";
  var inserts = ["%" + group_id + "%"];
  var sql = mysql.format(query, inserts);

  con.query(sql, callback);
};

/* VOLUNTEER HOURS */

WorkingGroups.getAllVolunteerHours = function(callback) {
  var query = "SELECT * FROM volunteer_hours";

  con.query(query, callback);
};

WorkingGroups.getAllUnreviewedVolunteerHours = function(callback) {
  var query =
    "SELECT * FROM volunteer_hours WHERE approved IS NULL ORDER BY date ASC";

  con.query(query, callback);
};

WorkingGroups.getHoursThisMonth = function(callback) {
  var query =
    "SELECT SUM(duration_as_decimal) FROM volunteer_hours WHERE MONTH(date) = MONTH(CURDATE())";

  con.query(query, callback);
};

WorkingGroups.getUnreviewedVolunteerHoursById = function(group_id, callback) {
  var query =
    "SELECT * FROM volunteer_hours WHERE working_group = ? AND approved IS NULL";
  var inserts = [group_id];
  var sql = mysql.format(query, inserts);

  con.query(sql, callback);
};

WorkingGroups.approveHours = function(id, callback) {
  var query = "UPDATE volunteer_hours SET approved = 1 WHERE id = ?";
  var inserts = [id];
  var sql = mysql.format(query, inserts);

  con.query(sql, callback);
};

WorkingGroups.denyHours = function(id, callback) {
  var query = "UPDATE volunteer_hours SET approved = 0 WHERE id = ?";
  var inserts = [id];
  var sql = mysql.format(query, inserts);

  con.query(sql, callback);
};

/* MEMBERSHIP REQUESTS */

WorkingGroups.getNewMembersByGroupId = function(group_id, callback) {
  var query =
    "SELECT * FROM working_group_requests WHERE working_group = ? AND verified = 1 AND MONTH(time_requested) = MONTH(CURDATE())";
  var inserts = [group_id];
  var sql = mysql.format(query, inserts);

  con.query(sql, callback);
};

WorkingGroups.getAllUnreviewedJoinRequests = function(group_id, callback) {
  var query =
    "SELECT * FROM working_group_requests WHERE working_group = ? AND verified IS NULL";
  var inserts = [group_id];
  var sql = mysql.format(query, inserts);

  con.query(sql, callback);
};

WorkingGroups.getJoinRequestByMemberId = function(
  member_id,
  group_id,
  callback
) {
  var query =
    "SELECT * FROM working_group_requests WHERE member_id = ? AND working_group = ? AND verified IS NULL";
  var inserts = [member_id, group_id];
  var sql = mysql.format(query, inserts);

  con.query(sql, callback);
};

WorkingGroups.approveJoinRequest = function(id, callback) {
  var query =
    "UPDATE working_group_requests SET verified = 1 WHERE request_id = ?";
  var inserts = [id];
  var sql = mysql.format(query, inserts);

  con.query(sql, callback);
};

WorkingGroups.createJoinRequest = function(member_id, group_id, callback) {
  var dt = new Date();
  Helpers.uniqueIntId(11, "working_group_requests", "request_id", function(id) {
    var query =
      "INSERT INTO working_group_requests (request_id, member_id, working_group, verified, time_requested) VALUES (?,?,?,?,?)";
    var inserts = [
      id,
      member_id,
      group_id,
      null,
      new Date(dt.setMonth(dt.getMonth()))
    ];
    var sql = mysql.format(query, inserts);

    con.query(sql, callback);
  });
};

WorkingGroups.createApprovedJoinRequest = function(
  member_id,
  group_id,
  callback
) {
  var dt = new Date();
  Helpers.uniqueIntId(11, "working_group_requests", "request_id", function(id) {
    var query =
      "INSERT INTO working_group_requests (request_id, member_id, working_group, verified, time_requested) VALUES (?,?,?,?,?)";
    var inserts = [
      id,
      member_id,
      group_id,
      1,
      new Date(dt.setMonth(dt.getMonth()))
    ];
    var sql = mysql.format(query, inserts);

    con.query(sql, callback);
  });
};

WorkingGroups.deleteJoinRequestById = function(request_id, callback) {
  var query = "DELETE FROM working_group_requests WHERE request_id = ?";
  var inserts = [request_id];
  var sql = mysql.format(query, inserts);
  con.query(sql, callback);
};

WorkingGroups.deleteJoinRequestByMemberIdAndGroupId = function(
  member_id,
  group_id,
  callback
) {
  var query =
    "DELETE FROM working_group_requests WHERE member_id = ? AND working_group = ?";
  var inserts = [member_id, group_id];
  var sql = mysql.format(query, inserts);
  con.query(sql, callback);
};

WorkingGroups.getJoinRequestById = function(id, callback) {
  var query = "SELECT * FROM working_group_requests WHERE request_id = ?";
  var inserts = [id];
  var sql = mysql.format(query, inserts);

  con.query(sql, callback);
};

WorkingGroups.denyJoinRequest = function(id, callback) {
  var query =
    "UPDATE working_group_requests SET verified = 0 WHERE request_id = ?";
  var inserts = [id];

  var sql = mysql.format(query, inserts);

  con.query(sql, callback);
};

/* VOLUNTEER HOURS */

WorkingGroups.getShiftById = function(shift_id, callback) {
  var query = "SELECT * FROM volunteer_hours WHERE shift_id = ?";
  var inserts = [shift_id];

  var sql = mysql.format(query, inserts);
  con.query(sql, callback);
};

WorkingGroups.approveShift = function(shift_id, callback) {
  var query = "UPDATE volunteer_hours SET approved = 1 WHERE shift_id = ?";
  var inserts = [shift_id];

  var sql = mysql.format(query, inserts);
  con.query(sql, callback);
};

WorkingGroups.denyShift = function(shift_id, callback) {
  var query = "UPDATE volunteer_hours SET approved = 0 WHERE shift_id = ?";
  var inserts = [shift_id];

  var sql = mysql.format(query, inserts);
  con.query(sql, callback);
};

WorkingGroups.createShift = function(shift, callback) {
  var dt = new Date();
  Helpers.uniqueIntId(11, "volunteer_hours", "shift_id", function(id) {
    var query =
      "INSERT INTO volunteer_hours (shift_id, member_id, date, duration_as_decimal, working_group, approved) VALUES (?,?,?,?,?,?)";
    var inserts = [
      id,
      shift.member_id,
      new Date(dt.setMonth(dt.getMonth())),
      shift.duration,
      shift.working_group,
      shift.approved
    ];
    var sql = mysql.format(query, inserts);

    con.query(sql, callback);
  });
};

WorkingGroups.getAllApprovedVolunteerHoursByGroupId = function(
  group_id,
  callback
) {
  var query =
    "SELECT * FROM volunteer_hours WHERE working_group = ? AND approved = 1";
  var inserts = [group_id];
  var sql = mysql.format(query, inserts);

  con.query(sql, callback);
};

/* MAKE NICE FUNCTIONS */

WorkingGroups.makeJoinRequestNice = function(request, callback) {
  var Members = require("./members");

  Members.getById(request.member_id, { class: "admin" }, function(err, member) {
    if (member && !err) {
      var beautifulRequest = {};
      beautifulRequest.name = member.first_name + " " + member.last_name;
      beautifulRequest.id = request.request_id;
      beautifulRequest.member_id = request.member_id;

      var options = { year: "numeric", month: "long", day: "numeric" };
      beautifulRequest.date = new Date(
        request.time_requested
      ).toLocaleDateString("en-GB", options);

      callback(beautifulRequest);
    } else {
      callback({});
    }
  });
};

WorkingGroups.makeVolunteerHoursNice = function(
  hours,
  allWorkingGroups,
  callback
) {
  var Members = require("./members");

  Members.getById(hours.member_id, { class: "admin" }, function(err, member) {
    if (err) {
      callback(null);
    } else {
      var beautifulHours = {};
      beautifulHours.name = member.first_name + " " + member.last_name;
      beautifulHours.id = hours.id;
      beautifulHours.member_id = hours.member_id;

      if (allWorkingGroups[hours.working_group]) {
        var group = allWorkingGroups[hours.working_group];
        beautifulHours.working_group = group.name;

        beautifulHours.duration = hours.duration_as_decimal;
        beautifulHours.tokens = Math.floor(
          hours.duration_as_decimal * group.rate
        );

        var options = { year: "numeric", month: "long", day: "numeric" };
        beautifulHours.date = new Date(hours.date).toLocaleDateString(
          "en-GB",
          options
        );

        callback(beautifulHours);
      }
    }
  });
};

WorkingGroups.updateGroup = function(group, callback) {
  var query =
    "UPDATE working_groups SET prefix = ?, name = ?, rate = ? WHERE group_id = ?";
  var inserts = [group.prefix, group.name, group.rate, group.group_id];
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
