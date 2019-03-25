// /food-collections/log

var router = require("express").Router();
var async = require("async");

var rootDir = process.env.CWD;

var FoodCollections = require(rootDir + "/app/models/food-collections");
var Members = require(rootDir + "/app/models/members");
var VolunteerHours = require(rootDir + "/app/models/volunteer-hours");
var Settings = require(rootDir + "/app/models/settings");

var Auth = require(rootDir + "/app/configs/auth");

router.get("/", function(req, res) {
  var organisations;
  try {
    organisations = JSON.parse(decodeURIComponent(req.query.organisations));
  } catch (err) {
    organisations = [];
  }

  FoodCollections.getOrganisations(function(err, allOrganisations) {
    Members.getAll(function(err, members) {
      if (!req.user) {
        members = null;
      }
      res.render("food-collections/log", {
        title: "Log Food Collection",
        foodCollectionsActive: true,
        member_id: req.query.member_id,
        allOrganisations: allOrganisations,
        organisations: organisations,
        uriOrganisations: encodeURIComponent(req.query.organisations),
        members: members
      });
    });
  });
});

router.post("/", function(req, res) {
  var organisations;
  try {
    organisations = JSON.parse(decodeURIComponent(req.query.organisations));
  } catch (err) {
    organisations = [];
  }

  req.query.organisations = encodeURIComponent(req.query.organisations);

  var member_id = req.body.member_id;
  var organisation_id = req.body.organisation_id;
  var amount = req.body.amount;
  var note = req.body.note;

  if (member_id) {
    Members.getById(member_id, { class: "admin" }, function(err, member) {
      if (member) {
        if (organisation_id) {
          FoodCollections.getOrganisations(function(err, allOrganisations) {
            if (allOrganisations[organisation_id]) {
              if (allOrganisations[organisation_id].active == 1) {
                if (!isNaN(amount) && amount > 0) {
                  if (req.user) {
                    FoodCollections.add(
                      member_id,
                      organisation_id,
                      amount,
                      note,
                      1,
                      function(err) {
                        if (!err) {
                          Settings.getAll(function(err, settings) {
                            var shift = {
                              member_id: member_id,
                              duration: 1,
                              working_group:
                                settings.foodCollectionsGroup.group_id,
                              note: "For food collection (automated)",
                              approved: 1
                            };

                            VolunteerHours.createShift(shift, function(err) {
                              if (!err) {
                                req.flash(
                                  "success_msg",
                                  "Collection & shift successfully logged!"
                                );
                                res.redirect(
                                  process.env.PUBLIC_ADDRESS +
                                    "/food-collections/log?member_id=" +
                                    member_id +
                                    "&organisations=" +
                                    req.query.organisations
                                );
                              } else {
                                req.flash(
                                  "error_msg",
                                  "Collection approved, but something went wrong logging the shift!"
                                );
                                res.redirect(
                                  process.env.PUBLIC_ADDRESS +
                                    "/food-collections/log?member_id=" +
                                    member_id +
                                    "&organisations=" +
                                    req.query.organisations
                                );
                              }
                            });
                          });
                        } else {
                          req.flash(
                            "error_msg",
                            "Something went wrong - please try again!"
                          );
                          res.redirect(
                            process.env.PUBLIC_ADDRESS +
                              "/food-collections/log?member_id=" +
                              member_id +
                              "&organisations=" +
                              req.query.organisations
                          );
                        }
                      }
                    );
                  } else {
                    FoodCollections.add(
                      member_id,
                      organisation_id,
                      amount,
                      note,
                      null,
                      function(err) {
                        if (!err) {
                          req.flash(
                            "success_msg",
                            "Collection logged - awaiting review by an admin!"
                          );
                          res.redirect(
                            process.env.PUBLIC_ADDRESS +
                              "/food-collections/log?member_id=" +
                              member_id +
                              "&organisations=" +
                              req.query.organisations
                          );
                        } else {
                          req.flash(
                            "error_msg",
                            "Something went wrong - please try again!"
                          );
                          res.redirect(
                            process.env.PUBLIC_ADDRESS +
                              "/food-collections/log?member_id=" +
                              member_id +
                              "&organisations=" +
                              req.query.organisations
                          );
                        }
                      }
                    );
                  }
                } else {
                  req.flash("error_msg", "Please enter a valid amount!");
                  res.redirect(
                    process.env.PUBLIC_ADDRESS +
                      "/food-collections/log?member_id=" +
                      member_id +
                      "&organisations=" +
                      req.query.organisations
                  );
                }
              } else {
                req.flash(
                  "error_msg",
                  "This organisation is no longer active!"
                );
                res.redirect(
                  process.env.PUBLIC_ADDRESS +
                    "/food-collections/log?member_id=" +
                    member_id +
                    "&organisations=" +
                    req.query.organisations
                );
              }
            } else {
              req.flash("error_msg", "Please select a valid organisation!");
              res.redirect(
                process.env.PUBLIC_ADDRESS +
                  "/food-collections/log?member_id=" +
                  member_id +
                  "&organisations=" +
                  req.query.organisations
              );
            }
          });
        } else {
          req.flash("error_msg", "Please select an organisation!");
          res.redirect(
            process.env.PUBLIC_ADDRESS +
              "/food-collections/log?member_id=" +
              member_id +
              "&organisations=" +
              req.query.organisations
          );
        }
      } else {
        req.flash("error_msg", "Member doesn't exist!");
        res.redirect(
          process.env.PUBLIC_ADDRESS +
            "/food-collections/log?organisations=" +
            req.query.organisations
        );
      }
    });
  } else {
    req.flash("error_msg", "Please enter your unique membership ID!");
    res.redirect(
      process.env.PUBLIC_ADDRESS +
        "/food-collections/log?organisations=" +
        req.query.organisations
    );
  }
});

module.exports = router;