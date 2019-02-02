// /api/get/notifications

var router = require("express").Router();
var async = require("async");
var moment = require("moment");

var rootDir = process.env.CWD;

var WorkingGroups = require(rootDir + "/app/models/working-groups");
var Notifications = require(rootDir + "/app/models/notifications");

router.use("/read", require("./read"));

router.get("/", function(req, res) {
  var notifications = [];

  Notifications.getAllMessages(req.user.id, function(err, messages) {
    async.each(
      messages,
      function(message, callback) {
        notifications.push({
          message: message.body,
          action: "javascript::void(0);",
          icon: "fas fa-envelope",
          time: moment(message.timestamp).fromNow()
        });
        callback();
      },
      function() {
        if (["staff", "admin", "volunteer"].includes(req.user.class)) {
          WorkingGroups.getAllUnreviewedVolunteerHours(function(err, shifts) {
            var working_groups = req.user.working_groups_arr;
            var shiftsNeedAttention = [];

            async.each(
              shifts,
              function(shift, callback) {
                if (working_groups.includes(shift.working_group)) {
                  shiftsNeedAttention.push(shift);
                }
                callback();
              },
              function() {
                if (shiftsNeedAttention.length > 0) {
                  notifications.push({
                    message: "You have volunteer hours waiting to be reviewed",
                    action:
                      process.env.PUBLIC_ADDRESS + "/volunteers/review-hours",
                    icon: "fas fa-clock",
                    time: moment(
                      shiftsNeedAttention[shiftsNeedAttention.length - 1].date
                    ).fromNow()
                  });
                }

                res.send(notifications);
              }
            );
          });
        } else {
          res.send(notifications);
        }
      }
    );
  });
});

module.exports = router;
