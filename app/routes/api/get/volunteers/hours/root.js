// /api/get/volunteers/hours

var router = require("express").Router();
var async = require("async");
var sanitizeHtml = require("sanitize-html");
var moment = require("moment");
moment.locale("en-gb");

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");
var VolunteerHours = Models.VolunteerHours;
var Members = Models.Members;

var Auth = require(rootDir + "/app/configs/auth");

router.get(
  "/",
  Auth.isLoggedIn,
  Auth.canAccessPage("volunteerHours", "review"),
  function(req, res) {
    var working_groups = req.user.working_groups;

    if (req.user.permissions.volunteerHours.review == true) {
      working_groups = req.user.allWorkingGroupsFlat;
    } else if (
      req.user.permissions.volunteerHours.review == "commonWorkingGroup"
    ) {
      working_groups = req.user.working_groups;
    }

    var formattedShifts = [];
    Members.getAll(function(err, membesArray, members) {
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
                var formattedShift = {};

                var member = {};

                if (members[shift.member_id]) {
                  member.name =
                    members[shift.member_id].first_name +
                    " " +
                    members[shift.member_id].last_name;
                } else {
                  member.name = "Unknown";
                }

                formattedShift.name =
                  "<a href='" +
                  process.env.PUBLIC_ADDRESS +
                  "/volunteers/view/" +
                  shift.member_id +
                  "'>" +
                  member.name +
                  "</a>";

                formattedShift.date = moment(shift.date).format("L");
                formattedShift.duration = shift.duration_as_decimal;
                formattedShift.note = shift.note || "-";
                if (formattedShift.note == "null") {
                  formattedShift.note = "-";
                }
                formattedShift.note = sanitizeHtml(formattedShift.note);

                formattedShift.working_group =
                  req.user.allWorkingGroupsObj[shift.working_group].name;

                formattedShift.options =
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
                formattedShifts.push(formattedShift);
                callback();
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
    });
  }
);

router.get(
  "/:group_id",
  Auth.isLoggedIn,
  Auth.canAccessPage("volunteerHours", "review"),
  function(req, res) {
    var formattedShifts = [];
    Members.getAll(function(err, membesArray, members) {
      VolunteerHours.getUnreviewedShiftsByGroupId(req.params.group_id, function(
        err,
        shifts
      ) {
        async.each(
          shifts,
          function(shift, callback) {
            if (
              req.user.permissions.volunteerHours.review == true ||
              (req.user.permissions.volunteerHours.review ==
                "commonWorkingGroup" &&
                req.user.working_groups.includes(shift.working_group))
            ) {
              var formattedShift = {};
              var member = {};

              if (members[shift.member_id]) {
                member.name =
                  members[shift.member_id].first_name +
                  " " +
                  members[shift.member_id].last_name;
              } else {
                member.name = "Unknown";
              }

              formattedShift.name =
                "<a href='" +
                process.env.PUBLIC_ADDRESS +
                "/volunteers/view/" +
                shift.member_id +
                "'>" +
                member.name +
                "</a>";

              formattedShift.date = moment(shift.date).format("L");
              formattedShift.duration = shift.duration_as_decimal;
              formattedShift.note = shift.note || "-";
              if (formattedShift.note == "null") {
                formattedShift.note = "-";
              }
              formattedShift.note = sanitizeHtml(formattedShift.note);

              formattedShift.working_group =
                req.user.allWorkingGroupsObj[shift.working_group].name;

              formattedShift.options =
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
              formattedShifts.push(formattedShift);
              callback();
            } else {
              callback();
            }
          },
          function() {
            res.send(formattedShifts);
          }
        );
      });
    });
  }
);

router.use("/by-member-id", require("./by-member-id"));

module.exports = router;
