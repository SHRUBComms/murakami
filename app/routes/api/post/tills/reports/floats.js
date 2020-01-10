// /api/post/tills/reports/floats

var router = require("express").Router();

var async = require("async");
var moment = require("moment");
moment.locale("en-gb");

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");
var Tills = Models.Tills;
var Users = Models.Users;
var TillActivity = Models.TillActivity;

var Auth = require(rootDir + "/app/configs/auth");
var Helpers = require(rootDir + "/app/helper-functions/root");

router.post(
  "/",
  Auth.isLoggedIn,
  Auth.canAccessPage("tills", "viewReports"),
  function(req, res) {
    var response = {
      status: "fail",
      msg: "Something went wrong!",
      activity: {}
    };

    var till_id = req.body.till_id;
    var datePeriod = req.body.datePeriod || "today";

    var startDate = req.body.startDate || null;
    var endDate = req.body.endDate || null;

    if (till_id) {
      Tills.getById(till_id, function(err, till) {
        if (till) {
          Helpers.plainEnglishDateRangeToDates(
            datePeriod,
            startDate,
            endDate,
            function(startDate, endDate) {
              TillActivity.getAllActivityBetweenTwoDatesByTillId(
                till_id,
                startDate,
                endDate,
                function(err, activity) {
                  if (activity.length > 0) {
                    Users.getAll(req.user, function(err, users, usersObj) {
                      var formattedActivity = [];
                      async.each(
                        activity,
                        function(action, callback) {
                          var formattedAction = {};
                          formattedAction.timestamp = moment(
                            action.timestamp
                          ).format("L hh:mm A");

                          if (action.opening == 1) {
                            formattedAction.action = "Opening";

                            formattedAction.summary =
                              "Counted Float: £" +
                              action.counted_float.toFixed(2);

                            formattedAction.discrepancy = "-";
                          } else {
                            formattedAction.action = "Closing";

                            formattedAction.summary =
                              "Counted Float: £" +
                              action.counted_float.toFixed(2);
                            formattedAction.summary += "<br />";
                            formattedAction.summary +=
                              "Expected Float: £" +
                              action.expected_float.toFixed(2);

                            let discrepancy = (
                              action.counted_float - action.expected_float
                            ).toFixed(2);

                            if (discrepancy >= 0) {
                              formattedAction.discrepancy = "£" + discrepancy;
                            } else {
                              formattedAction.discrepancy =
                                "-£" + Math.abs(discrepancy).toFixed(2);
                            }
                          }

                          if (action.note) {
                            formattedAction.note = action.note;
                          } else {
                            formattedAction.note = "-";
                          }

                          if (usersObj[action.user_id]) {
                            formattedAction.user =
                              usersObj[action.user_id].name;
                          } else {
                            formattedAction.user = "Unknown User";
                          }
                          formattedActivity.push(formattedAction);
                          callback();
                        },
                        function() {
                          res.send(formattedActivity);
                        }
                      );
                    });
                  } else {
                    res.send([]);
                  }
                }
              );
            }
          );
        } else {
          response.msg = "No valid till selected.";
          res.send(response);
        }
      });
    } else {
      response.msg = "No till selected.";
      res.send(response);
    }
  }
);

module.exports = router;
