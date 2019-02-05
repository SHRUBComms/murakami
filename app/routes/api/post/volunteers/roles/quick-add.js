// /api/post/volunteers/roles/quick-add

var router = require("express").Router();

var rootDir = process.env.CWD;

var Volunteers = require(rootDir + "/app/models/volunteers");

var Auth = require(rootDir + "/app/configs/auth");

router.post(
  "/",
  Auth.isLoggedIn,
  Auth.isOfClass(["admin", "staff", "volunteer"]),
  function(req, res) {
    var working_group = req.body.working_group;
    var title = req.body.title;

    var working_groups = req.user.all_working_groups_arr;
    working_groups.push("na");

    console.log(working_groups);

    if (working_groups.includes(working_group) && title) {
      Volunteers.quickAddRole(working_group, title, function(err, role) {
        if (!err && role) {
          res.send({ status: "ok", role: role });
        } else {
          res.send({ status: "fail", msg: "Something went wrong!" });
        }
      });
    } else {
      res.send({
        status: "fail",
        msg: "Please enter a title and a valid working group."
      });
    }
  }
);

module.exports = router;
