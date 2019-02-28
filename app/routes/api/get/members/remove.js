// /api/get/members/remove

var router = require("express").Router();

var rootDir = process.env.CWD;

var Members = require(rootDir + "/app/models/members");

var Auth = require(rootDir + "/app/configs/auth");

router.get("/:member_id", Auth.isLoggedIn, function(req, res) {
  var member_id = req.params.member_id;

  Members.updateStatus(member_id, 0, function(err) {
    if (err) {
      req.flash("error_msg", "Something went wrong!");
    } else {
      req.flash("success_msg", "Membership revoked!");
    }
    res.redirect(process.env.PUBLIC_ADDRESS + "/members/view/" + member_id);
  });
});

module.exports = router;
