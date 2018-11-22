// /api/get/users/last-login

var router = require("express").Router();

var rootDir = process.env.CWD;

var Users = require(rootDir + "/app/models/users");
var Attempts = require(rootDir + "/app/models/attempts");

var Auth = require(rootDir + "/app/configs/auth");

router.get("/:user_id", Auth.isLoggedIn, Auth.isAdmin, function(req, res) {
  Users.getById(req.params.user_id, function(err, user) {
    if (!err && user[0]) {
      Attempts.getLastLogin(req.params.user_id, function(err, lastLogin) {
        if (!err && lastLogin[0]) {
          res.send(
            new Date(lastLogin[0].login_timestamp).toLocaleDateString("en-GB")
          );
        } else {
          res.send("Never logged in");
        }
      });
    } else {
      res.send("Never logged in");
    }
  });
});

module.exports = router;
