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
            member: member
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
      if (!err && member && member.canUpdate) {
        var updatedMember = req.body.member;
        updatedMember.member_id = member.member_id;
        updatedMember.is_member = member.is_member ? 1 : 0;
        if (["admin", "staff"].includes(req.user.class)) {
          if (updatedMember.balance % 1 != 0 || updatedMember.balance < 0) {
            updatedMember.balance = member.balance;
          }

          if (
            !["lifetime", "staff", "trustee", "none"].includes(
              updatedMember.membership_type
            )
          ) {
            updatedMember.membership_type = member.membership_type;
          } else {
            if (updatedMember.membership_type == "none") {
              updatedMember.membership_type = null;
            } else {
              updatedMember.current_exp_membership = "01/01/9999";
            }
          }

          if (!moment(updatedMember.current_exp_membership).isValid()) {
            updatedMember.current_exp_membership = moment(
              member.current_exp_membership
            ).toDate();
          }

          if (moment(updatedMember.current_exp_membership).isAfter(moment())) {
            updatedMember.is_member = 1;
          } else {
            updatedMember.is_member = 0;
          }

          if (
            updatedMember.free == "free" ||
            ["lifetime", "staff", "trustee"].includes(
              updatedMember.membership_type
            )
          ) {
            updatedMember.free = 1;
          } else {
            updatedMember.free = 0;
          }

          req
            .checkBody("member[email]", "Please enter an email address")
            .notEmpty();
          req
            .checkBody(
              "member[email]",
              "Please enter a shorter email address (<= 89 characters)"
            )
            .isLength({ max: 89 });
          req
            .checkBody("member[email]", "Please enter a valid email address")
            .isEmail();

          req
            .checkBody("member[address]", "Please enter an address")
            .notEmpty();
        } else {
          updatedMember.email = member.email;
          updatedMember.phone_no = member.phone_no;
          updatedMember.address = member.address;
          updatedMember.balance = member.balance;
          updatedMember.membership_type = member.membership_type;
          updatedMember.free = member.free;
        }

        req
          .checkBody("member[first_name]", "Please enter a first name")
          .notEmpty();
        req
          .checkBody(
            "member[first_name]",
            "Please enter a shorter first name (<= 20 characters)"
          )
          .isLength({ max: 20 });

        req
          .checkBody("member[last_name]", "Please enter a last name")
          .notEmpty();
        req
          .checkBody(
            "member[last_name]",
            "Please enter a shorter last name (<= 30 characters)"
          )
          .isLength({ max: 30 });

        var errors = req.validationErrors();

        if (!errors) {
          Members.updateBasic(updatedMember, function(err) {
            if (!err) {
              req.flash("success_msg", "Member updated successfully!");
              res.redirect(
                process.env.PUBLIC_ADDRESS +
                  "/members/view/" +
                  updatedMember.member_id
              );
            } else {
              res.render("members/update", {
                errors: [{ msg: "Something went wrong, please try again!" }],
                title: "Update Member",
                membersActive: true,
                member: updatedMember
              });
            }
          });
        } else {
          res.render("members/update", {
            errors: errors,
            title: "Update Member",
            membersActive: true,
            member: updatedMember
          });
        }
      } else {
        req.flash("error_msg", "Something went wrong, please try again!");
        res.redirect(
          process.env.PUBLIC_ADDRESS + "/members/view/" + req.params.member_id
        );
      }
    });
  }
);

module.exports = router;
