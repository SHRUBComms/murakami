// /api/get/notifications/read

var router = require("express").Router();
var async = require("async");

var rootDir = process.env.CWD;

var Notifications = require(rootDir + "/app/models/notifications");

var Auth = require(rootDir + "/app/configs/auth");

router.get("/:notification_id", Auth.isLoggedIn, function(req, res) {
  var response = {};
  response.status = "fail";
  response.msg = "Notification has already been marked as read!"
  Notifications.markAsRead(req.params.notification_id, req.user.id, function(err){
    if(err){
      res.send(response);
    } else {
      response.status = "ok";
      response.msg = "Notification marked as read"
      res.send(response);
    }
  })
});

module.exports = router;
