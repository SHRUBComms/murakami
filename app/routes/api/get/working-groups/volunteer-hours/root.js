// /api/get/working-groups/volunteer-hours

var router = require("express").Router();
var async = require("async");

var rootDir = process.env.CWD;

var WorkingGroups = require(rootDir + "/app/models/working-groups");

var Auth = require(rootDir + "/app/configs/auth");

router.get(
  "/:group_id",
  Auth.isLoggedIn,
  Auth.isOfClass(["admin", "volunteer"]),
  function(req, res) {
    WorkingGroups.getAll(function(err, allWorkingGroups) {
      if (allWorkingGroups[req.params.group_id]) {
        WorkingGroups.getUnreviewedVolunteerHoursById(
          req.params.group_id,
          function(err, hours) {
            if (err || !hours) {
              res.send([]);
            } else {
              var formattedHours = [];

              async.eachOf(
                hours,
                function(hour, i, callback) {
                  WorkingGroups.makeVolunteerHoursNice(
                    hour,
                    allWorkingGroups,
                    function(hour) {
                      formattedHours[i] = {};

                      formattedHours[i].name =
                        '<a href="/members/view/' +
                        hour.member_id +
                        '">' +
                        hour.name +
                        "</a>";
                      formattedHours[i].date = hour.date;
                      formattedHours[i].duration = hour.duration;
                      formattedHours[i].tokens = hour.tokens;
                      formattedHours[i].options =
                        '<div class="btn-group d-flex">' +
                        '<a class="btn btn-success w-100" onclick="volunteerHoursAjax(\'/api/get/working-groups/volunteer-hours/approve/' +
                        hours[i].shift_id +
                        "')\">Approve</a>" +
                        '<a class="btn btn-danger w-100" onclick="volunteerHoursAjax(\'/api/get/working-groups/volunteer-hours/deny/' +
                        hours[i].shift_id +
                        "')\">Deny</a>" +
                        "</div>";
                      callback();
                    }
                  );
                },
                function(err) {
                  res.send(formattedHours);
                }
              );
            }
          }
        );
      } else {
        res.send([]);
      }
    });
  }
);

router.use("/approve", require("./approve"));
router.use("/deny", require("./deny"));

module.exports = router;
