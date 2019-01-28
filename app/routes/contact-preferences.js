var router = require("express").Router();

var rootDir = process.env.CWD;

var Members = require(rootDir + "/app/models/members");

router.get("/:member_id", function(req, res) {
  Members.getById(req.params.member_id, { class: "till" }, function(
    err,
    member
  ) {
    if (!err && member) {
      res.render("contact-preferences.hbs", {
        title: "Contact Preferences",
        member: member
      });
    } else {
      res.render("error", {
        title: "Page Not Found",
        notFound: true
      });
    }
  });
});

module.exports = router;
