// /api/get/volunteers/hours

var router = require("express").Router();
var async = require("async");
var moment = require("moment");
moment.locale("en-gb");
var sanitizeHtml = require("sanitize-html");

var rootDir = process.env.CWD;

var VolunteerHours = require(rootDir + "/app/models/volunteer-hours");
var Members = require(rootDir + "/app/models/members");

var Auth = require(rootDir + "/app/configs/auth");

router.get(
  "/",
  Auth.isLoggedIn,
  Auth.isOfClass(["admin", "staff", "volunteer"]),
  function(req, res) {
    var working_groups = req.user.working_groups;
    var formattedShifts = [];

    async.each(
      working_groups,
      function(group, callback) {
        VolunteerHours.getUnreviewedShiftsByGroupId(group, function(
          err,
          shifts
        ) {
          async.each(
            shifts,
            function(shift, callback) {
              Members.getById(shift.member_id, req.user, function(err, member) {
                if (member && !err) {
                  shift.name =
                    "<a href='" +
                    process.env.PUBLIC_ADDRESS +
                    "/volunteers/view/" +
                    member.member_id +
                    "'>" +
                    member.first_name +
                    " " +
                    member.last_name +
                    "</a>";

                  shift.date = moment(shift.date).format("l");
                  shift.duration = shift.duration_as_decimal;
                  shift.note = shift.note || "-";
                  if (shift.note == "null") {
                    shift.note = "-";
                  }
                  shift.note = sanitizeHtml(shift.note);

                  shift.working_group =
                    req.user.allWorkingGroupsObj[shift.working_group].name;

                  shift.options =
                    '<div class="btn-group d-flex">' +
                    '<a class="btn btn-success w-100" onclick="volunteerHoursAjax(\'' +
                    process.env.PUBLIC_ADDRESS +
                    "/api/get/volunteers/hours/approve/" +
                    shift.shift_id +
                    "')\">Approve</a>" +
                    '<a class="btn btn-danger w-100" onclick="volunteerHoursAjax(\'' +
                    process.env.PUBLIC_ADDRESS +
                    "/api/get/volunteers/hours/deny/" +
                    shift.shift_id +
                    "')\">Deny</a>" +
                    "</div>";
                  formattedShifts.push(shift);
                  callback();
                } else {
                  callback();
                }
              });
            },
            function() {
              callback();
            }
          );
        });
      },
      function() {
        res.send(formattedShifts);
      }
    );
  }
);

router.get(
  "/:group_id",
  Auth.isLoggedIn,
  Auth.isOfClass(["admin", "staff", "volunteer"]),
  function(req, res) {
    var formattedShifts = [];
    VolunteerHours.getUnreviewedShiftsByGroupId(req.params.group_id, function(
      err,
      shifts
    ) {
      async.each(
        shifts,
        function(shift, callback) {
          if (
            req.user.working_groups.includes(shift.working_group) ||
            req.user.class == "admin"
          ) {
            Members.getById(shift.member_id, req.user, function(err, member) {
              if (member && !err) {
                shift.name =
                  "<a href='" +
                  process.env.PUBLIC_ADDRESS +
                  "/volunteers/view/" +
                  member.member_id +
                  "'>" +
                  member.first_name +
                  " " +
                  member.last_name +
                  "</a>";

                shift.date = moment(shift.date).format("l");
                shift.duration = shift.duration_as_decimal;
                shift.note = shift.note || "-";
                if (shift.note == "null") {
                  shift.note = "-";
                }
                shift.note = sanitizeHtml(shift.note);

                shift.working_group =
                  req.user.allWorkingGroupsObj[shift.working_group].name;

                shift.options =
                  '<div class="btn-group d-flex">' +
                  '<a class="btn btn-success w-100" onclick="volunteerHoursAjax(\'' +
                  process.env.PUBLIC_ADDRESS +
                  "/api/get/volunteers/hours/approve/" +
                  shift.shift_id +
                  "')\">Approve</a>" +
                  '<a class="btn btn-danger w-100" onclick="volunteerHoursAjax(\'' +
                  process.env.PUBLIC_ADDRESS +
                  "/api/get/volunteers/hours/deny/" +
                  shift.shift_id +
                  "')\">Deny</a>" +
                  "</div>";
                formattedShifts.push(shift);
                callback();
              } else {
                callback();
              }
            });
          } else {
            callback();
          }
        },
        function() {
          res.send(formattedShifts);
        }
      );
    });
  }
);

router.use("/approve", require("./approve"));
router.use("/deny", require("./deny"));
router.use("/by-member-id", require("./by-member-id"));

module.exports = router;
