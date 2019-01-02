var con = require("./index");
var mysql = require("mysql");

var async = require("async");

var Notifications = {};

Notifications.getAll = function(user_id, callback) {
  var query = "SELECT * FROM notifications WHERE user_id = ?";
  var inserts = [user_id];
  var sql = mysql.format(query, inserts);
  con.query(sql,function(err, notifications){
    if(err || !notifications){
      callback(err, null)
    } else {
      var oldNotifications = [];
      var newNotifications = [];
      async.each(notifications, function(notification, callback){
        if(notification.readState == 0){
          newNotifications.push(notification);
          callback()
        } else {
          oldNotifications.push(notification)
          callback()
        }
      }, function(){
        notifications = {notifications, old: oldNotifications, new: newNotifications};
        callback(null, notifications)
      })

    }
  });
};

Notifications.getNew = function(user_id, callback) {
  var query = "SELECT * FROM notifications WHERE user_id = ? AND readState = 0";
  var inserts = [user_id];
  var sql = mysql.format(query, inserts);
  con.query(sql, callback);
};

Notifications.markAsRead = function(notification_id, user_id, callback) {
  var query = "UPDATE notifications SET readState = 1 WHERE user_id = ? and notification_id = ?";
  var inserts = [user_id, notification_id];
  var sql = mysql.format(query, inserts);
  con.query(sql, callback);
}

Notifications.markAsUnread = function(notification_id, user_id, callback) {
  var query = "UPDATE notifications SET readState = 0 WHERE user_id = ? and notification_id = ?";
  var inserts = [user_id, notification_id];
  var sql = mysql.format(query, inserts);
  con.query(sql, callback);
}

Notifications.markAllAsRead = function(user_id, callback) {
  var query = "UPDATE notifications SET readState = 1 WHERE user_id = ?";
  var inserts = [user_id, notification_id];
  var sql = mysql.format(query, inserts);
  con.query(sql, callback);
}

module.exports = Notifications;
