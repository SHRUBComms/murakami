// /api/get/members/destroy

var router = require("express").Router();

var rootDir = process.env.CWD;

var Members = require(rootDir + "/app/models/members");

var Auth = require(rootDir + "/app/configs/auth");

router.get("/:member_id", Auth.isLoggedIn, Auth.isOfClass(["admin"]), function(req, res) {
  var member_id = req.params.member_id;

  Members.redact(member_id, function(err) {
    if (err) {
      req.flash("error_msg", "Something went wrong!");
      res.redirect(process.env.PUBLIC_ADDRESS + "/members/view/" + member_id);
    } else {
      req.flash("success_msg", "Member destroyed!");
      res.redirect(process.env.PUBLIC_ADDRESS + "/members");
    }
  });
});

module.exports = router;
