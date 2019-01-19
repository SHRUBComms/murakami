var con = require("./index");
var mysql = require("mysql");

var async = require("async");
var moment = require("moment");
moment.locale("en-gb");

var Notifications = {};

Notifications.getAll = function(user_id, callback) {
  var query = "SELECT * FROM notifications WHERE user_id = ?";
  var inserts = [user_id];
  var sql = mysql.format(query, inserts);
  con.query(sql, function(err, notifications) {
    if (err || !notifications) {
      callback(err, null);
    } else {
      async.each(
        notifications,
        function(notification, callback) {
          notification.timestamp = moment(notification.timestamp).fromNow();
          callback();
        },
        function() {
          callback(null, notifications);
        }
      );
    }
  });
};

Notifications.remove = function(notification_id, user_id, callback) {
  var query =
    "DELETE FROM notifications WHERE user_id = ? and notification_id = ?";
  var inserts = [user_id, notification_id];
  var sql = mysql.format(query, inserts);
  con.query(sql, callback);
};

module.exports = Notifications;
