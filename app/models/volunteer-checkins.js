var con = require("./index");
var mysql = require("mysql");
var async = require("async");
var moment = require("moment");
moment.locale("en-gb")

var rootDir = process.env.CWD;

var Helpers = require(rootDir + "/app/configs/helpful_functions");

var VolunteerCheckIns = {};

VolunteerCheckIns.sanitize = function(checkin, callback) {
  checkin.timestamp = moment(checkin.timestamp).format("L")
  try {
    checkin.questionnaire = JSON.parse(checkin.questionnaire);
  } catch (err) {
    checkin.questionnaire = {};
  }
  callback(checkin);
};

VolunteerCheckIns.getById = function(checkin_id, callback) {
  var query = "SELECT * FROM volunteer_checkins WHERE checkin_id = ?";
  var inserts = [checkin_id];
  var sql = mysql.format(query, inserts);
  con.query(sql, function(err, checkin) {
    if (!err && checkin[0]) {
      VolunteerCheckIns.sanitize(checkin[0], function(sanitizedCheckin) {
        console.log()
        callback(null, sanitizedCheckin);
      });
    } else {
      callback(err, null);
    }
  });
};

VolunteerCheckIns.getLast = function(member_id, callback) {
  var query =
    "SELECT max(timestamp), * FROM volunteer_checkins WHERE member_id = ?";
  var inserts = [member_id];
  var sql = mysql.format(query, inserts);
  con.query(sql, function(err, checkin) {
    if (!err && checkin[0]) {
      callback(null, checkin[0]);
    } else {
      callback(err, null);
    }
  });
};

VolunteerCheckIns.create = function(member_id, user_id, questionnaire, callback) {
  var query =
    "INSERT INTO volunteer_checkins (checkin_id, member_id, user_id, questionnaire, timestamp) VALUES (?,?,?,?,?)";

    Helpers.uniqueBase64Id(10, "volunteer_checkins", "checkin_id", function(checkin_id) {
      var inserts = [
        checkin_id,
        member_id,
        user_id,
        JSON.stringify(questionnaire),
        new Date()
      ];
      var sql = mysql.format(query, inserts);
      con.query(sql, callback);

    });



};

module.exports = VolunteerCheckIns;
