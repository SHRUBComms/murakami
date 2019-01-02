// /api/get/notifications/read-all

var router = require("express").Router();
var async = require("async");

var rootDir = process.env.CWD;

var Notifications = require(rootDir + "/app/models/notifications");

var Auth = require(rootDir + "/app/configs/auth");

router.get("/", Auth.isLoggedIn, function(req, res) {
  var response = {};
  response.status = "fail";
  response.msg = "Something went wrong!"
  Notifications.markAllAsRead(req.user.id, function(err){
    if(err){
      res.send(response);
    } else {
      response.status = "ok";
      response.msg = "All notifications marked as read"
      res.send(response);
    }
  })
});

module.exports = router;
