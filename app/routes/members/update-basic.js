// /members/update-basic

var router = require("express").Router();

var rootDir = process.env.CWD;

var Members = require(rootDir + "/app/models/members");

var Auth = require(rootDir + "/app/configs/auth");

router.get(
  "/:member_id",
  Auth.isLoggedIn,
  Auth.isOfClass(["admin", "staff"]),
  function(req, res) {
    Members.getById(req.params.member_id, req.user, function(err, member) {
      if (err || !member) {
        req.flash("error_msg", "Member not found!");
        res.back();
      } else {
        res.render("members/update-basic", {
          title: "Update Member",
          membersActive: true,

          member_id: req.params.member_id,
          first_name: member.first_name,
          last_name: member.last_name
        });
      }
    });
  }
);

router.post(
  "/:member_id",
  Auth.isLoggedIn,
  Auth.isOfClass(["admin", "volunteer"]),
  function(req, res) {
    Members.getById(req.params.member_id, req.user, function(err, member) {
      if (err || !member) {
        req.flash("error_msg", "Something went wrong, please try again!");
        res.redirect(process.env.PUBLIC_ADDRESS + "/members/update/" + req.params.member_id);
      } else {
        var first_name = req.body.first_name.trim();
        var last_name = req.body.last_name.trim();

        // Validation
        req.checkBody("first_name", "Please enter a first name").notEmpty();
        req
          .checkBody(
            "first_name",
            "Please enter a shorter first name (<= 20 characters)"
          )
          .isLength({ max: 20 });

        req.checkBody("last_name", "Please enter a last name").notEmpty();
        req
          .checkBody(
            "last_name",
            "Please enter a shorter last name (<= 30 characters)"
          )
          .isLength({ max: 30 });

        var member = {
          member_id: req.params.member_id,
          first_name: first_name,
          last_name: last_name
        };

        // Parse request's body
        var errors = req.validationErrors();
        if (errors) {
          res.render("members/update", {
            title: "Update Member",
            membersActive: true,
            errors: errors,
            member_id: req.params.member_id,
            first_name: first_name,
            last_name: last_name
          });
        } else {
          Members.updateBasicTill(member, function(err, member) {
            if (err) throw err;
            req.flash("success_msg", first_name + " updated!");
            res.redirect(process.env.PUBLIC_ADDRESS + "/members/view/" + req.params.member_id);
          });
        }
      }
    });
  }
);

module.exports = router;
