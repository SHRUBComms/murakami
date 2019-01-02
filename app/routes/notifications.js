// /nofitications

var router = require("express").Router();

var rootDir = process.env.CWD;

var Notifications = require(rootDir + "/app/models/notifications");

var Auth = require(rootDir + "/app/configs/auth");

router.get("/", Auth.isLoggedIn, function(req, res) {
  Notifications.getAll(req.user.id, function(err, notifications){
    res.render("notifications", {
      title: "Notifications",
      notifications: notifications
    })
  })
});

module.exports = router;
