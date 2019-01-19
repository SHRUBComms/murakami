// /api/get/working-groups/volunteer-hours/approve

var router = require("express").Router();

var rootDir = process.env.CWD;

var WorkingGroups = require(rootDir + "/app/models/working-groups");

var Tills = require(rootDir + "/app/models/tills");
var Members = require(rootDir + "/app/models/members");

var Auth = require(rootDir + "/app/configs/auth");

router.get(
  "/:shift_id",
  Auth.isLoggedIn,
  Auth.isOfClass(["admin", "volunteer"]),
  function(req, res) {
    var message = {
      status: "fail",
      msg: null
    };

    WorkingGroups.getShiftById(req.params.shift_id, function(err, shift) {
      if (err || !shift[0]) {
        message.status = "fail";
        message.msg = "Couldn't find that shift!";
        res.send(message);
      }

      var shift = shift[0];

      Members.getById(shift.member_id, req.user, function(err, member) {
        if (err) throw err;

        WorkingGroups.getAll(function(err, allWorkingGroups) {
          if (allWorkingGroups[shift.working_group]) {
            var group = allWorkingGroups[shift.working_group];
            WorkingGroups.approveShift(req.params.shift_id, function(err) {
              if (err) throw err;

              var transaction = {
                member_id: member.member_id,
                till_id: null,
                user_id: req.user.id,
                date: new Date(),
                summary: {
                  totals: { tokens: Math.floor(shift.duration) * group.rate },
                  bill: [
                    {
                      item_id: "volunteering",
                      tokens: Math.floor(shift.duration) * group.rate
                    }
                  ],
                  comment: "with " + group.name
                },
                amount: Math.floor(shift.duration) * group.rate
              };

              if (transaction.amount > 0) {
                transaction.summary = JSON.stringify(transaction.summary);
                Tills.addTransaction(transaction, function(err) {
                  Members.updateBalance(
                    member.member_id,
                    +member.balance + +transaction.amount,
                    function(err) {
                      Members.updateLastVolunteered(
                        member.member_id,
                        function() {
                          if (member.first_volunteered) {
                            Members.updateFirstVolunteered(
                              member.member_id,
                              function() {
                                if (member.free) {
                                  Members.renew(
                                    member.member_id,
                                    "3_months",
                                    function() {
                                      message.status = "ok";
                                      message.msg =
                                        "Shift approved - " +
                                        transaction.amount +
                                        " token(s) issued!";
                                      res.send(message);
                                    }
                                  );
                                } else {
                                  message.status = "ok";
                                  message.msg =
                                    "Shift approved - " +
                                    transaction.amount +
                                    " token(s) issued!";
                                  res.send(message);
                                }
                              }
                            );
                          } else {
                            if (member.free) {
                              Members.renew(
                                member.member_id,
                                "3_months",
                                function() {
                                  message.status = "ok";
                                  message.msg =
                                    "Shift approved - " +
                                    transaction.amount +
                                    " token(s) issued!";
                                  res.send(message);
                                }
                              );
                            } else {
                              message.status = "ok";
                              message.msg =
                                "Shift approved - " +
                                transaction.amount +
                                " token(s) issued!";
                              res.send(message);
                            }
                          }
                        }
                      );
                    }
                  );
                });
              } else {
                Members.updateLastVolunteered(member.member_id, function() {
                  if (member.first_volunteered) {
                    Members.updateFirstVolunteered(
                      member.member_id,
                      function() {
                        if (member.free) {
                          Members.renew(
                            member.member_id,
                            "3_months",
                            function() {
                              message.status = "ok";
                              message.msg =
                                "Shift approved - no tokens issued!";
                              res.send(message);
                            }
                          );
                        } else {
                          message.status = "ok";
                          message.msg = "Shift approved - no tokens issued!";
                          res.send(message);
                        }
                      }
                    );
                  } else {
                    if (member.free) {
                      Members.renew(member.member_id, "3_months", function() {
                        message.status = "ok";
                        message.msg = "Shift approved - no tokens issued!";
                        res.send(message);
                      });
                    } else {
                      message.status = "ok";
                      message.msg = "Shift approved - no tokens issued!";
                      res.send(message);
                    }
                  }
                });
              }
            });
          } else {
            message.status = "fail";
            message.msg = "Invalid group!";
            res.send(message);
          }
        });
      });
    });
  }
);

module.exports = router;
