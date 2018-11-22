// /api/get/members/renew

var router = require("express").Router();

var rootDir = process.env.CWD;

var Members = require(rootDir + "/app/models/members");

var Auth = require(rootDir + "/app/configs/auth");

router.get("/:member_id/:length", Auth.isLoggedIn, function(req, res) {
  var member_id = req.params.member_id;
  var length = req.params.length;

  if (length == "12") {
    length = "full_year";
  } else if (length == "6") {
    length = "half_year";
  }

  Members.renew(member_id, length, function(err, member) {
    if (err) {
      req.flash("error_msg", "Something went wrong!");
      res.redirect("/members/view/" + member_id);
    } else {
      req.flash("success_msg", "Membership renewed!");
      res.redirect("/members/view/" + member_id);
    }
  });
});

module.exports = router;
