// /users

var router = require("express").Router();
var async = require("async");

var rootDir = process.env.CWD;

var Users = require(rootDir + "/app/models/users");
var WorkingGroups = require(rootDir + "/app/models/working-groups");

var Auth = require(rootDir + "/app/configs/auth");
var Helpers = require(rootDir + "/app/configs/helpful_functions");

router.get("/", Auth.isLoggedIn, Auth.isOfClass(["admin", "staff"]), function(
  req,
  res
) {
  Users.getAll(req.user, function(err, users) {
    res.render("users/all", {
      title: "Users",
      users: users,
      usersActive: true
    });
  });
});

router.use("/add", require("./add"));
router.use("/update", require("./update"));
router.use("/deactivate", require("./deactivate"));
router.use("/change-password", require("./change-password"));

module.exports = router;
