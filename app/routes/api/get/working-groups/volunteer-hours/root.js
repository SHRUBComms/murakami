// /api/get/working-groups/volunteer-hours

var router = require("express").Router();
var async = require("async");
var moment = require("moment");
moment.locale("en-gb");
var sanitizeHtml = require("sanitize-html");

var rootDir = process.env.CWD;

var WorkingGroups = require(rootDir + "/app/models/working-groups");
var Members = require(rootDir + "/app/models/members");

var Auth = require(rootDir + "/app/configs/auth");

router.get(
  "/",
  Auth.isLoggedIn,
  Auth.isOfClass(["admin", "staff", "volunteer"]),
  function(req, res) {
    var working_groups = req.user.working_groups_arr;
    var formattedShifts = [];

    async.each(
      working_groups,
      function(group, callback) {
        WorkingGroups.getUnreviewedVolunteerHoursById(group, function(
          err,
          shifts
        ) {
          async.each(
            shifts,
            function(shift, callback) {
              if (req.user.working_groups_arr.includes(shift.working_group)) {
                Members.getById(shift.member_id, req.user, function(
                  err,
                  member
                ) {
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
                    shift.note = sanitizeHtml(shift.note);

                    shift.working_group =
                      req.user.allWorkingGroupsObj[shift.working_group].name;

                    shift.options =
                      '<div class="btn-group d-flex">' +
                      '<a class="btn btn-success w-100" onclick="volunteerHoursAjax(\'/api/get/working-groups/volunteer-hours/approve/' +
                      shift.shift_id +
                      "')\">Approve</a>" +
                      '<a class="btn btn-danger w-100" onclick="volunteerHoursAjax(\'/api/get/working-groups/volunteer-hours/deny/' +
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
    WorkingGroups.getUnreviewedVolunteerHoursById(req.params.group_id, function(
      err,
      shifts
    ) {
      async.each(
        shifts,
        function(shift, callback) {
          if (req.user.working_groups_arr.includes(shift.working_group)) {
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
                shift.tokens =
                  Math.floor(shift.duration) *
                  (req.user.allWorkingGroupsObj[shift.working_group].rate || 0);

                shift.working_group =
                  req.user.allWorkingGroupsObj[shift.working_group].name;

                shift.options =
                  '<div class="btn-group d-flex">' +
                  '<a class="btn btn-success w-100" onclick="volunteerHoursAjax(\'/api/get/working-groups/volunteer-hours/approve/' +
                  shift.shift_id +
                  "')\">Approve</a>" +
                  '<a class="btn btn-danger w-100" onclick="volunteerHoursAjax(\'/api/get/working-groups/volunteer-hours/deny/' +
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

module.exports = router;
