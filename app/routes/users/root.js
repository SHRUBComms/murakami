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
  Users.getAll(function(err, users) {
    WorkingGroups.getAll(function(err, working_groups) {
      if (err) throw err;
      async.eachOf(
        users,
        function(user, i, callback) {
          if (req.user.class == "staff") {
            if (
              ((user.class == "volunteer" || user.class == "till") &&
                Helpers.hasOneInCommon(
                  JSON.parse(user.working_groups),
                  req.user.working_groups
                )) ||
              req.user.id == user.id
            ) {
              Users.makeNice(user, working_groups, function(user) {
                users[i] = user;
                callback();
              });
            } else {
              users[i] = null;
              callback();
            }
          } else {
            Users.makeNice(user, working_groups, function(user) {
              users[i] = user;
              callback();
            });
          }
        },
        function(err) {
          console.log(users);
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
