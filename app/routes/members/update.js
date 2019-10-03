// /members/update

var router = require("express").Router();
var moment = require("moment");
moment.locale("en-gb");

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");
var Members = Models.Members;

var Auth = require(rootDir + "/app/configs/auth");
var Helpers = require(rootDir + "/app/helper-functions/root");

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
          req.user.permissions.members.view == true ||
          (req.user.permissions.members.view == "commonWorkingGroup" &&
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
            current_exp_membership: member.current_exp_membership,
            membership_type: member.membership_type
          });
        } else {
          req.flash(
            "error_msg",
            "You don't have permission to update this member!"
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
    Members.getById(req.params.member_id, req.user, function(err, member) {
      if (err || !member || !member.canUpdate) {
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
        var membership_type;

        if (["staff", "admin"].includes(req.user.class)) {
          email = req.body.email.trim();
          phone_no = req.body.phone_no.trim();
          address = req.body.address.trim();
          free = req.body.free;
          current_exp_membership = req.body.current_exp_membership;
          membership_type = req.body.membership_type;

          if (membership_type == "none") {
            membership_type = null;
          }

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
          current_exp_membership = member.current_exp_membership;
          membership_type = member.membership_type;
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

          req.checkBody("address", "Please enter an address").notEmpty();

          if (phone_no) {
            req
              .checkBody(
                "phone_no",
                "Please enter a shorter phone number (<= 15)"
              )
              .isLength({ max: 15 });
          }

          if (moment(current_exp_membership)) {
            if (
              moment(current_exp_membership).isAfter(
                moment(member.current_init_membership)
              )
            ) {
              Members.updateExpiryDate(
                member.member_id,
                current_exp_membership,
                function(err) {}
              );
            }
          }

          if (
            [null, "staff", "lifetime", "trustee"].includes(membership_type)
          ) {
            Members.update(
              { membership_type: membership_type },
              { where: { member_id: member.member_id } }
            ).nodeify(function() {});
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
          Members.updateBasic(member, function(err) {
            console.log(err)
            if (!err) {
              req.flash("success_msg", first_name + " updated!");
              res.redirect(
                process.env.PUBLIC_ADDRESS +
                  "/members/view/" +
                  req.params.member_id
              );
            } else {
              res.render("members/update", {
                errors: [{ msg: "Something went wrong! Try again" }],
                title: "Update Member",
                membersActive: true,
                member_id: req.params.member_id,
                first_name: first_name,
                last_name: last_name,
                email: email,
                phone_no: phone_no,
                address: address,
                free: free,
                current_exp_membership: current_exp_membership
              });
            }
          });
        }
      }
    });
  }
);

module.exports = router;
