// /volunteers/check-in

var router = require("express").Router();
var async = require("async");

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");

var Users = Models.Users;
var Members = Models.Members;
var Volunteers = Models.Volunteers;
var VolunteerCheckIns = Models.VolunteerCheckIns;
var VolunteerRoles = Models.VolunteerRoles;

var Auth = require(rootDir + "/app/configs/auth");
var Helpers = require(rootDir + "/app/configs/helpful_functions");

var expectedQuestionnaire = {
  W7cnfJVW: {
    question_id: "W7cnfJVW",
    question: "What’s going well and what’s not going well?"
  },
  DuRN9396: {
    question_id: "DuRN9396",
    question:
      "Are you getting what you want from this role? Are you developing the skills you’d like to?",
    fromInitialSurvey: "goals"
  },
  tfM2S2R4: {
    question_id: "tfM2S2R4",
    question: "Do you need any additional support?"
  },
  ykCcA43Z: {
    question_id: "ykCcA43Z",
    question: "Would you like any additional training?",
    fromInitialSurvey: "interests"
  },
  Zmumsq7X: {
    question_id: "Zmumsq7X",
    question: "Any additional notes/remarks?"
  }
};

router.get("/", function(req, res) {
  res.redirect(process.env.PUBLIC_ADDRESS + "/volunteers/manage");
});

router.get(
  "/:member_id",
  Auth.isLoggedIn,
  Auth.canAccessPage("volunteers", "conductCheckIn"),
  function(req, res) {
    Members.getById(req.params.member_id, req.user, function(err, member) {
      if (err || !member) {
        req.flash("error_msg", "Member not found!");
        res.redirect(process.env.PUBLIC_ADDRESS + "/volunteers/manage");
      } else {
        Volunteers.getVolunteerById(req.params.member_id, req.user, function(
          err,
          volInfo
        ) {
          if (volInfo) {
            if (volInfo.conductCheckIn) {
              VolunteerCheckIns.getById(volInfo.checkin_id, function(
                err,
                checkin
              ) {
                Users.getAll(req.user, function(err, users, usersObj) {
                  res.render("volunteers/check-in", {
                    title: "Volunteer Check-in",
                    volunteersActive: true,
                    allUsers: usersObj,
                    member: member,
                    volInfo: volInfo,
                    lastCheckIn: checkin,
                    questionnaire: expectedQuestionnaire
                  });
                });
              });
            } else {
              req.flash(
                "error_msg",
                "You don't have permission to conduct a check-in this volunteer!"
              );
              res.redirect(process.env.PUBLIC_ADDRESS + "/volunteers/manage");
            }
          } else {
            req.flash("error_msg", "Member is not a volunteer!");
            res.redirect(
              process.env.PUBLIC_ADDRESS +
                "/members/make-volunteer/" +
                member.member_id
            );
          }
        });
      }
    });
  }
);

router.post(
  "/:member_id",
  Auth.isLoggedIn,
  Auth.canAccessPage("volunteers", "conductCheckIn"),
  function(req, res) {
    Members.getById(req.params.member_id, req.user, function(err, member) {
      if (err || !member) {
        req.flash("error_msg", "Member not found!");
        res.redirect(process.env.PUBLIC_ADDRESS + "/volunteers/manage");
      } else {
        Volunteers.getVolunteerById(req.params.member_id, req.user, function(
          err,
          volInfo
        ) {
          if (volInfo) {
            if (volInfo.conductCheckIn) {
              var questionnaire = req.body.questionnaire;
              var questionnaireValid = true;
              async.eachOf(
                expectedQuestionnaire,
                function(question, question_id, callback) {
                  if (!questionnaire[question_id]) {
                    questionnaireValid = false;
                  }
                  callback();
                },
                function() {
                  if (questionnaireValid) {
                    VolunteerCheckIns.add(
                      req.params.member_id,
                      req.user.id,
                      questionnaire,
                      function(err) {
                        if (!err) {
                          req.flash(
                            "success_msg",
                            "Questionnaire complete! Please update this volunteer's details to finish check-in"
                          );
                          res.redirect(
                            process.env.PUBLIC_ADDRESS +
                              "/volunteers/update/" +
                              req.params.member_id
                          );
                        } else {
                          
                          req.flash(
                            "error_msg",
                            "Something went wrong! Try again"
                          );
                          res.redirect(
                            process.env.PUBLIC_ADDRESS +
                              "/volunteers/check-in/" +
                              req.params.member_id
                          );
                        }
                      }
                    );
                  } else {
                    req.flash(
                      "error_msg",
                      "Please complete the questionnaire!"
                    );
                    res.redirect(
                      process.env.PUBLIC_ADDRESS +
                        "/volunteers/check-in/" +
                        req.params.member_id
                    );
                  }
                }
              );
            } else {
              req.flash(
                "error_msg",
                "You don't have permission to conduct a check-in this volunteer!"
              );
              res.redirect(process.env.PUBLIC_ADDRESS + "/volunteers/manage");
            }
          } else {
            req.flash("error_msg", "Member is not a volunteer!");
            res.redirect(
              process.env.PUBLIC_ADDRESS +
                "/members/make-volunteer/" +
                member.member_id
            );
          }
        });
      }
    });
  }
);

module.exports = router;
