// /volunteers/hours/log

var router = require("express").Router();
var async = require("async");
var request = require("request");
var moment = require("moment");
var Recaptcha = require("express-recaptcha").Recaptcha;
var sanitizeHtml = require("sanitize-html");

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");

var WorkingGroups = Models.WorkingGroups;
var Members = Models.Members;
var Volunteers = Models.Volunteers;
var VolunteerRoles = Models.VolunteerRoles;
var VolunteerHours = Models.VolunteerHours;
var Tills = Models.Tills;

var recaptcha = new Recaptcha(
  process.env.RECAPTCHA_SITE_KEY,
  process.env.RECAPTCHA_SECRET_KEY
);
router.get("/", function(req, res) {
  var allowed = false;

  try {
    if (!req.user || (req.user && req.user.permissions.volunteerHours.log)) {
      allowed = true;
    }
  } catch (err) {}

  if (allowed) {
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
            till_id: till_id,
            group_id: req.user.working_groups[0],
            status: 1
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
  } else {
    res.redirect(process.env.PUBLIC_ADDRESS + "/");
  }
});

router.post("/", function(req, res) {
  var message = {};

  var allowed = false;

  try {
    if (!req.user || (req.user && req.user.permissions.volunteerHours.log)) {
      allowed = true;
    }
  } catch (err) {}

  if (allowed) {
    if (req.user) {
      var shift = req.body.shift;

      Members.getById(shift.member_id, req.user, function(err, member) {
        if (err || !member) {
          res.send({ status: "fail", msg: "Please select a valid member!" });
        } else {
          if (!isNaN(shift.duration)) {
            if (
              req.user.permissions.volunteerHours.log == true ||
              (req.user.permissions.volunteerHours.log ==
                "commonWorkingGroup" &&
                req.user.working_groups.includes(shift.working_group))
            ) {
              WorkingGroups.getAll(function(err, allWorkingGroups) {
                if (allWorkingGroups[shift.working_group]) {
                  var group = allWorkingGroups[shift.working_group];

                  if (
                    ["admin", "staff", "volunteer"].includes(req.user.class)
                  ) {
                    shift.approved = 1;
                    VolunteerHours.createShift(shift, function(err) {
                      if (err) {
                        res.send({
                          status: "fail",
                          msg: "Something went wrong please try again!"
                        });
                      } else {
                        message.status = "ok";
                        message.msg =
                          "Shift logged - " +
                          member.name +
                          ", " +
                          shift.duration +
                          " hour(s) for " +
                          group.name;

                        if (
                          moment(member.current_exp_membership).isBefore(
                            moment().add(3, "months")
                          )
                        ) {
                          Members.renew(
                            member.member_id,
                            "3_months",
                            function() {
                              Members.updateFreeStatus(
                                member.member_id,
                                1,
                                function() {
                                  message.msg += ". Membership renewed!";
                                  res.send(message);
                                }
                              );
                            }
                          );
                        } else {
                          Members.updateStatus(
                            member.member_id,
                            1,
                            function() {}
                          );
                          res.send(message);
                        }
                      }
                    });
                  } else {
                    shift.approved = 1;

                    VolunteerHours.createShift(shift, function(err) {
                      res.send({
                        status: "ok",
                        msg: "Shift logged successfully!"
                      });
                    });
                  }
                }
              });
            } else {
              message.status = "fail";
              message.msg = "Please select a valid working group!";
              res.send(message);
            }
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
              VolunteerRoles.getAll(function(
                err,
                rolesArray,
                rolesByGroup,
                rolesObj
              ) {
                Members.getById(
                  member_id,
                  {
                    permissions: { members: { name: true } },
                    allVolunteerRoles: rolesObj
                  },
                  function(err, member) {
                    if (member) {
                      var shift = {};
                      shift.member_id = member_id;
                      shift.working_group = working_group;
                      shift.duration = duration;
                      shift.note = sanitizeHtml(note);
                      shift.approved = 1;

                      request.post(
                        {
                          url:
                            "https://www.google.com/recaptcha/api/siteverify",
                          form: {
                            secret: process.env.RECAPTCHA_SECRET_KEY,
                            response: req.body["g-recaptcha-response"]
                          }
                        },
                        function(error, response, body) {
                          if (body) {
                            body = JSON.parse(body);
                            if (body.success == true) {
                              VolunteerHours.createShift(shift, function(err) {
                                req.flash(
                                  "success_msg",
                                  "Shift logged!"
                                );
                                res.redirect(
                                  process.env.PUBLIC_ADDRESS +
                                    "/volunteers/hours/log"
                                );
                              });
                            } else {
                              req.flash(
                                "error",
                                "Please confirm that you're not a robot"
                              );
                              res.redirect(
                                process.env.PUBLIC_ADDRESS +
                                  "/volunteers/hours/log"
                              );
                            }
                          } else {
                            req.flash(
                              "error",
                              "Please confirm that you're not a robot"
                            );
                            res.redirect(
                              process.env.PUBLIC_ADDRESS +
                                "/volunteers/hours/log"
                            );
                          }
                        }
                      );
                    } else {
                      req.flash("error", "No member associated with that ID");
                      res.redirect(
                        process.env.PUBLIC_ADDRESS + "/volunteers/hours/log"
                      );
                    }
                  }
                );
              });
            } else {
              req.flash("error", "Please select a valid working group");
              res.redirect(
                process.env.PUBLIC_ADDRESS + "/volunteers/hours/log"
              );
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
  } else {
    res.redirect(process.env.PUBLIC_ADDRESS + "/");
  }
});

module.exports = router;
