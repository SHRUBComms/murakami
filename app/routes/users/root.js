// /users

var router = require("express").Router();
var async = require("async");

var rootDir = process.env.CWD;

var Users = require(rootDir + "/app/models/users");
var WorkingGroups = require(rootDir + "/app/models/working-groups");

var Auth = require(rootDir + "/app/configs/auth");

router.get("/", Auth.isLoggedIn, Auth.isAdmin, function(req, res) {
  Users.getAll(function(err, users) {
    WorkingGroups.getAll(function(err, working_groups) {
      if (err) throw err;
      async.eachOf(
        users,
        function(user, i, callback) {
          Users.makeNice(user, working_groups, function(user) {
            users[i] = user;
            callback();
          });
        },
        function(err) {
          res.render("users/all", {
            title: "Users",
            users: users,
            usersActive: true
          });
        }
      );
    });
  });
});

router.use("/add", require("./add"));
router.use("/update", require("./update"));
router.use("/deactivate", require("./deactivate"));
router.use("/change-password", require("./change-password"));

module.exports = router;
