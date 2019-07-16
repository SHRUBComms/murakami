// /users/manage

var router = require("express").Router();
var async = require("async");

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");
var Users = Models.Users;

var Auth = require(rootDir + "/app/configs/auth");

router.get("/", Auth.isLoggedIn, Auth.canAccessPage("users", "view"), function(
  req,
  res
) {
  Users.getAll(req.user, function(err, users, usersObj) {
    res.render("users/manage", {
      title: "Users",
      users: usersObj,
      usersActive: true
    });
  });
});

module.exports = router;
