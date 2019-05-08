// /api/get/members/destroy

var router = require("express").Router();

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");

var Members = Models.Members;

var Auth = require(rootDir + "/app/configs/auth");

router.get(
  "/:member_id",
  Auth.isLoggedIn,
  Auth.canAccessPage("members", "delete"),
  function(req, res) {
    var member_id = req.params.member_id;
    Members.getById(member_id, req.user, function(err, member) {
      if (!err && member) {
        if (member.canDelete) {
          Members.redact(member_id, function(err) {
            if (err) {
              req.flash("error_msg", "Something went wrong!");
              res.redirect(
                process.env.PUBLIC_ADDRESS + "/members/view/" + member_id
              );
            } else {
              req.flash("success_msg", "Member destroyed!");
              res.redirect(process.env.PUBLIC_ADDRESS + "/members/manage");
            }
          });
        } else {
          req.flash("error_msg", "You don't have permission!");
          res.redirect(
            process.env.PUBLIC_ADDRESS + "/members/view/" + member_id
          );
        }
      } else {
        req.flash("error_msg", "Something went wrong!");
        res.redirect(process.env.PUBLIC_ADDRESS + "/members/view/" + member_id);
      }
    });
  }
);

module.exports = router;
