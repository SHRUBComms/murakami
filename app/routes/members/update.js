// /members/update

var router = require("express").Router();
var moment = require("moment");
moment.locale("en-gb");

var rootDir = process.env.CWD;

var Members = require(rootDir + "/app/models/members");

var Auth = require(rootDir + "/app/configs/auth");
var Helpers = require(rootDir + "/app/configs/helpful_functions");

router.get(
  "/:member_id",
  Auth.isLoggedIn,
  Auth.canAccessPage("members", "update"),
  function(req, res) {
    Members.getById(req.params.member_id, req.user, function(err, member) {
      if (err || !member) {
        req.flash("error_msg", "Member not found!");
        res.redirect(process.env.PUBLIC_ADDRESS + "/members/manage");
      } else {
        if (
          req.user.class == "admin" ||
          req.user.class == "till" ||
          (req.user.class == "staff" &&
            Helpers.hasOneInCommon(
              member.working_groups,
              req.user.working_groups
            ))
        ) {
          res.render("members/update", {
            title: "Update Member",
            membersActive: true,

            member_id: req.params.member_id,
            first_name: member.first_name,
            last_name: member.last_name,
            email: member.email,
            phone_no: member.phone_no,
            address: member.address,
            free: member.free,
            current_exp_membership: moment(
              member.current_exp_membership,
              "l"
            ).format("YYYY-MM-DD")
          });
        } else {
          req.flash(
            "error_msg",
            "You must have a common working group with this member to update their profile!"
          );
          res.redirect(
            process.env.PUBLIC_ADDRESS + "/members/view/" + member.member_id
          );
        }
      }
    });
  }
);

router.post(
  "/:member_id",
  Auth.canAccessPage("members", "update"),

  function(req, res) {
    Members.getById(req.params.member_id, { class: "admin" }, function(
      err,
      member
    ) {
      if (err || !member) {
        req.flash("error_msg", "Something went wrong, please try again!");
        res.redirect(
          process.env.PUBLIC_ADDRESS + "/members/update/" + req.params.member_id
        );
      } else {
        var first_name = req.body.first_name.trim();
        var last_name = req.body.last_name.trim();

        var email;
        var phone_no;
        var address;
        var free;
        var current_exp_membership;

        if (["staff", "admin"].includes(req.user.class)) {
          email = req.body.email.trim();
          phone_no = req.body.phone_no.trim();
          address = req.body.address.trim();
          free = req.body.free;
          current_exp_membership = req.body.current_exp_membership;

          if (free == "free") {
            free = 1;
          } else {
            free = 0;
          }
        } else {
          email = member.email;
          phone_no = member.phone_no;
          address = member.address;
          free = member.free;
        }

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

        if (["staff", "admin"].includes(req.user.class)) {
          req.checkBody("email", "Please enter an email address").notEmpty();
          req
            .checkBody(
              "email",
              "Please enter a shorter email address (<= 89 characters)"
            )
            .isLength({ max: 89 });
          req
            .checkBody("email", "Please enter a valid email address")
            .isEmail();

          if (phone_no) {
            req
              .checkBody(
                "phone_no",
                "Please enter a shorter phone number (<= 15)"
              )
              .isLength({ max: 15 });
          }

          if (moment(current_exp_membership)) {
            console.log(member.current_init_membership, current_exp_membership);
            if (
              moment(current_exp_membership).isAfter(
                moment(member.current_init_membership, "L")
              )
            ) {
              Members.updateExpiryDate(
                member.member_id,
                current_exp_membership,
                function(err) {}
              );
            }
          }
        }

        var member = {
          member_id: req.params.member_id,
          first_name: first_name,
          last_name: last_name,
          email: email,
          phone_no: phone_no,
          address: address,
          free: free
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
            last_name: last_name,
            email: email,
            phone_no: phone_no,
            address: address,
            free: free,
            current_exp_membership: current_exp_membership
          });
        } else {
          Members.updateBasic(member, function(err, member) {
            if (err) throw err;

            req.flash("success_msg", first_name + " updated!");
            res.redirect(
              process.env.PUBLIC_ADDRESS +
                "/members/view/" +
                req.params.member_id
            );
          });
        }
      }
    });
  }
);

module.exports = router;
