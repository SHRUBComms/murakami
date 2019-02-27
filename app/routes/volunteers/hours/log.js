// /volunteers/hours/log

var router = require("express").Router();
var async = require("async");
var request = require("request");
var moment = require("moment");
var Recaptcha = require("express-recaptcha").Recaptcha;
var sanitizeHtml = require("sanitize-html");

var rootDir = process.env.CWD;

var WorkingGroups = require(rootDir + "/app/models/working-groups");
var Members = require(rootDir + "/app/models/members");
var Volunteers = require(rootDir + "/app/models/volunteers");
var Tills = require(rootDir + "/app/models/tills");

var recaptcha = new Recaptcha(
  process.env.RECAPTCHA_SITE_KEY,
  process.env.RECAPTCHA_SECRET_KEY
);
router.get("/", function(req, res) {
  WorkingGroups.getAll(function(err, working_groups) {
    if (req.user) {
      var tillMode = false;
      var till_id = req.query.till_id || null;
      if (till_id) {
        tillMode = true;
      }

      res.render("volunteers/hours/log", {
        tillMode: tillMode,
        logVolunteerHoursActive: true,
        till: {
          till_id: till_id
        },
        title: "Log Volunteer Hours",
        volunteerHoursActive: true,
        captcha: recaptcha.render(),
        working_groups: working_groups
      });
    } else {
      if (req.query.member_id) {
        var member_id = req.query.member_id;
      }

      var till_id = req.query.till_id;
      res.render("volunteers/hours/log", {
        title: "Log Volunteer Hours",
        logoutActive: true,
        member_id: member_id,
        captcha: recaptcha.render(),
        working_groups: working_groups,
        till: {
          till_id: till_id
        }
      });
    }
  });
});

router.post("/", function(req, res) {
  var message = {};

  if (req.user) {
    var shift = req.body.shift;

    Members.getById(shift.member_id, req.user, function(err, member) {
      if (err || !member) {
        res.send({ status: "fail", msg: "Please select a valid member!" });
      } else {
        if (!isNaN(shift.duration)) {
          WorkingGroups.getAll(function(err, allWorkingGroups) {
            if (allWorkingGroups[shift.working_group]) {
              var group = allWorkingGroups[shift.working_group];

              if (["admin", "staff", "volunteer"].includes(req.user.class)) {
                shift.approved = 1;
                WorkingGroups.createShift(shift, function(err) {
                  if (err) {
                    res.send({
                      status: "fail",
                      msg: "Something went wrong please try again!"
                    });
                  } else {
                    message.status = "ok";
                    message.msg =
                      "Shift logged - " +
                      member.full_name +
                      ", " +
                      shift.duration +
                      " hour(s) for " +
                      group.name;

                    if (
                      moment(member.current_exp_membership).isBefore(
                        moment().add(3, "months")
                      )
                    ) {
                      Members.renew(member.member_id, "3_months", function() {
                        Members.updateFreeStatus(
                          member.member_id,
                          1,
                          function() {
                            message.msg += ". Membership renewed!";
                            res.send(message);
                          }
                        );
                      });
                    } else {
                      res.send(message);
                    }
                  }
                });
              } else {
                shift.approved = null;

                WorkingGroups.createShift(shift, function(err) {
                  res.send({
                    status: "ok",
                    msg: "Shift logged - awaiting review by an admin!"
                  });
                });
              }
            }
          });
        } else {
          message.status = "fail";
          message.msg = "Please enter valid duration!";
          res.send(message);
        }
      }
    });
  } else {
    var member_id = req.body.member_id;
    var duration = req.body.duration;
    var working_group = req.body.working_group;
    var note = req.body.note || null;

    if (!isNaN(duration) && duration >= 0.25) {
      if (!note || (note && note.length <= 200)) {
        WorkingGroups.getAll(function(err, allWorkingGroups) {
          if (allWorkingGroups[working_group]) {
            Volunteers.getAllRoles(function(
              err,
              rolesArray,
              rolesByGroup,
              rolesObj
            ) {
              Members.getById(
                member_id,
                { class: "admin", allVolunteerRoles: rolesObj },
                function(err, member) {
                  if (member) {
                    var shift = {};
                    shift.member_id = member_id;
                    shift.working_group = working_group;
                    shift.duration = duration;
                    shift.note = sanitizeHtml(note);
                    shift.approved = null;

                    request.post(
                      {
                        url: "https://www.google.com/recaptcha/api/siteverify",
                        form: {
                          secret: process.env.RECAPTCHA_SECRET_KEY,
                          response: req.body["g-recaptcha-response"]
                        }
                      },
                      function(error, response, body) {
                        if (body) {
                          body = JSON.parse(body);
                          if (body.success == true) {
                            WorkingGroups.createShift(shift, function(err) {
                              req.flash(
                                "success_msg",
                                "Shift logged - awaiting review by an admin!"
                              );
                              res.redirect(process.env.PUBLIC_ADDRESS + "/volunteers/hours/log");
                            });
                          } else {
                            req.flash(
                              "error",
                              "Please confirm that you're not a robot"
                            );
                            res.redirect(process.env.PUBLIC_ADDRESS + "/volunteers/hours/log");
                          }
                        } else {
                          req.flash(
                            "error",
                            "Please confirm that you're not a robot"
                          );
                          res.redirect(process.env.PUBLIC_ADDRESS + "/volunteers/hours/log");
                        }
                      }
                    );
                  } else {
                    req.flash("error", "No member associated with that ID");
                    res.redirect(process.env.PUBLIC_ADDRESS + "/volunteers/hours/log");
                  }
                }
              );
            });
          } else {
            req.flash("error", "Please select a valid working group");
            res.redirect(process.env.PUBLIC_ADDRESS + "/volunteers/hours/log");
          }
        });
      } else {
        req.flash("error", "Please enter a note less than 200 characters.");
        res.redirect(process.env.PUBLIC_ADDRESS + "/volunteers/hours/log");
      }
    } else {
      req.flash("error", "Please enter a valid duration");
      res.redirect(process.env.PUBLIC_ADDRESS + "/volunteers/hours/log");
    }
  }
});

module.exports = router;
