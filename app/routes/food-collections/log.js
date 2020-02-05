// /food-collections/log

var router = require("express").Router();
var async = require("async");

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");
var FoodCollections = Models.FoodCollections;
var FoodCollectionsKeys = Models.FoodCollectionsKeys;
var FoodCollectionsOrganisations = Models.FoodCollectionsOrganisations;
var Members = Models.Members;
var VolunteerHours = Models.VolunteerHours;
var Settings = Models.Settings;

var Auth = require(rootDir + "/app/configs/auth");

router.get(
  "/",
  Auth.isLoggedIn,
  Auth.canAccessPage("foodCollections", "log"),
  function(req, res) {
    FoodCollectionsOrganisations.getAll(function(err, allOrganisations) {
      Members.getAll(function(err, members) {
        res.render("food-collections/log", {
          title: "Log Food Collection",
          foodCollectionsActive: true,
          allOrganisations: allOrganisations,
          members: members
        });
      });
    });
  }
);

router.get("/:key", Auth.isNotLoggedIn, function(req, res) {
  FoodCollectionsKeys.getById(req.params.key, function(err, foodCollectionKey) {
    if (!err && foodCollectionKey) {
      if (foodCollectionKey.active == 1) {
        Members.getById(
          foodCollectionKey.member_id,
          { permissions: { members: { name: true } } },
          function(err, member) {
            if (!err && member) {
              FoodCollectionsOrganisations.getAll(function(
                err,
                allOrganisations
              ) {
                res.render("food-collections/log", {
                  title: "Log Food Collection",
                  foodCollectionsActive: true,
                  foodCollectionKey: foodCollectionKey,
                  allOrganisations: allOrganisations,
                  member: member
                });
              });
            } else {
              res.render("error", {
                title: "Invalid Link",
                specificError: {
                  title: "Invalid Link",
                  message:
                    "Your link isn't valid! Please get in touch with your co-ordinator."
                }
              });
            }
          }
        );
      } else {
        res.render("error", {
          title: "Invalid Link",
          specificError: {
            title: "Invalid Link",
            message:
              "Your link has been disabled! Please get in touch with your co-ordinator."
          }
        });
      }
    } else {
      res.render("error", {
        title: "Invalid Link",
        specificError: {
          title: "Invalid Link",
          message:
            "Your link isn't valid! Please get in touch with your co-ordinator."
        }
      });
    }
  });
});

router.post(
  "/",
  Auth.isLoggedIn,
  Auth.canAccessPage("foodCollections", "log"),
  function(req, res) {
    var member_id = req.body.member_id;
    var organisation_id = req.body.organisation_id;
    var destination_organisation_id = req.body.destination_organisation_id;
    var amount = req.body.amount;
    var note = req.body.note;

    if (req.user.permissions.foodCollections.log) {
      if (member_id) {
        Members.getById(
          member_id,
          { permissions: { members: { name: true } } },
          function(err, member) {
            if (member) {
              if (organisation_id) {
                if (destination_organisation_id) {
                  FoodCollectionsOrganisations.getAll(function(
                    err,
                    allOrganisations
                  ) {
                    if (
                      allOrganisations[organisation_id] &&
                      allOrganisations[destination_organisation_id]
                    ) {
                      if (
                        allOrganisations[organisation_id].active == 1 &&
                        allOrganisations[destination_organisation_id].active ==
                          1
                      ) {
                        if (organisation_id != destination_organisation_id) {
                          if (!isNaN(amount) && amount > 0) {
                            FoodCollections.add(
                              member_id,
                              organisation_id,
                              destination_organisation_id,
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

                                    VolunteerHours.createShift(shift, function(
                                      err
                                    ) {
                                      if (!err) {
                                        req.flash(
                                          "success_msg",
                                          "Collection & shift successfully logged!"
                                        );
                                        res.redirect(
                                          process.env.PUBLIC_ADDRESS +
                                            "/food-collections/log"
                                        );
                                      } else {
                                        req.flash(
                                          "error_msg",
                                          "Collection approved, but something went wrong logging the shift!"
                                        );
                                        res.redirect(
                                          process.env.PUBLIC_ADDRESS +
                                            "/food-collections/log"
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
                                      "/food-collections/log"
                                  );
                                }
                              }
                            );
                          } else {
                            req.flash(
                              "error_msg",
                              "Please enter a valid amount!"
                            );
                            res.redirect(
                              process.env.PUBLIC_ADDRESS +
                                "/food-collections/log"
                            );
                          }
                        } else {
                          req.flash(
                            "error_msg",
                            "Pick-up and drop-off organisations must be different!"
                          );
                          res.redirect(
                            process.env.PUBLIC_ADDRESS + "/food-collections/log"
                          );
                        }
                      } else {
                        req.flash(
                          "error_msg",
                          "The selected organisations are no longer active!"
                        );
                        res.redirect(
                          process.env.PUBLIC_ADDRESS + "/food-collections/log"
                        );
                      }
                    } else {
                      req.flash(
                        "error_msg",
                        "Please select a valid organisations!"
                      );
                      res.redirect(
                        process.env.PUBLIC_ADDRESS + "/food-collections/log"
                      );
                    }
                  });
                } else {
                  req.flash(
                    "error_msg",
                    "Please select a drop-off organisation!"
                  );
                  res.redirect(
                    process.env.PUBLIC_ADDRESS + "/food-collections/log"
                  );
                }
              } else {
                req.flash("error_msg", "Please select a pick-up organisation!");
                res.redirect(
                  process.env.PUBLIC_ADDRESS + "/food-collections/log"
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
          }
        );
      } else {
        req.flash("error_msg", "Please select a member!");
        res.redirect(
          process.env.PUBLIC_ADDRESS +
            "/food-collections/log?organisations=" +
            req.query.organisations
        );
      }
    } else {
      res.redirect(process.env.PUBLIC_ADDRESS + "/");
    }
  }
);

router.post("/:key", Auth.isNotLoggedIn, function(req, res) {
  var member_id = req.body.member_id;
  var organisation_id = req.body.organisation_id;
  var destination_organisation_id = req.body.destination_organisation_id;
  var amount = req.body.amount;
  var note = req.body.note;

  FoodCollectionsKeys.getById(req.params.key, function(err, foodCollectionKey) {
    if (!err && foodCollectionKey) {
      if (foodCollectionKey.active == 1) {
        if (member_id) {
          Members.getById(
            member_id,
            { permissions: { members: { name: true } } },
            function(err, member) {
              if (member) {
                if (organisation_id && destination_organisation_id) {
                  FoodCollectionsOrganisations.getAll(function(
                    err,
                    allOrganisations
                  ) {
                    if (
                      allOrganisations[organisation_id] &&
                      allOrganisations[destination_organisation_id]
                    ) {
                      if (
                        (foodCollectionKey.organisations.includes(
                          organisation_id
                        ) ||
                          allOrganisations[organisation_id].default) &&
                        (foodCollectionKey.organisations.includes(
                          destination_organisation_id
                        ) ||
                          allOrganisations[destination_organisation_id].default)
                      ) {
                        if (
                          allOrganisations[organisation_id].active == 1 &&
                          allOrganisations[destination_organisation_id]
                            .active == 1
                        ) {
                          if (organisation_id != destination_organisation_id) {
                            if (!isNaN(amount) && amount > 0) {
                              FoodCollections.add(
                                member_id,
                                organisation_id,
                                destination_organisation_id,
                                amount,
                                note,
                                null,
                                function(err) {
                                  if (!err) {
                                    Settings.getAll(function(err, settings) {
                                      var shift = {
                                        member_id: member_id,
                                        duration: 1,
                                        working_group:
                                          settings.foodCollectionsGroup
                                            .group_id,
                                        note: "For food collection (automated)",
                                        approved: 1
                                      };

                                      VolunteerHours.createShift(
                                        shift,
                                        function(err) {
                                          if (!err) {
                                            req.flash(
                                              "success_msg",
                                              "Collection successfully logged!"
                                            );
                                            res.redirect(
                                              process.env.PUBLIC_ADDRESS +
                                                "/food-collections/log/" +
                                                req.params.key
                                            );
                                          } else {
                                            req.flash(
                                              "error_msg",
                                              "Collection approved, but something went wrong logging the shift!"
                                            );
                                            res.redirect(
                                              process.env.PUBLIC_ADDRESS +
                                                "/food-collections/log/" +
                                                req.params.key
                                            );
                                          }
                                        }
                                      );
                                    });
                                  } else {
                                    req.flash(
                                      "error_msg",
                                      "Something went wrong - please try again!"
                                    );
                                    res.redirect(
                                      process.env.PUBLIC_ADDRESS +
                                        "/food-collections/log/" +
                                        req.params.key
                                    );
                                  }
                                }
                              );
                            } else {
                              req.flash(
                                "error_msg",
                                "Please enter a valid amount!"
                              );
                              res.redirect(
                                process.env.PUBLIC_ADDRESS +
                                  "/food-collections/log/" +
                                  req.params.key
                              );
                            }
                          } else {
                            req.flash(
                              "error_msg",
                              "Pick-up and drop-off organisations must be different!"
                            );
                            res.redirect(
                              process.env.PUBLIC_ADDRESS +
                                "/food-collections/log/" +
                                req.params.key
                            );
                          }
                        } else {
                          req.flash(
                            "error_msg",
                            "The selected pick-up organisation is no longer active!"
                          );
                          res.redirect(
                            process.env.PUBLIC_ADDRESS +
                              "/food-collections/log/" +
                              req.params.key
                          );
                        }
                      } else {
                        req.flash(
                          "error_msg",
                          "Please select valid organisations!"
                        );
                        res.redirect(
                          process.env.PUBLIC_ADDRESS +
                            "/food-collections/log/" +
                            req.params.key
                        );
                      }
                    } else {
                      req.flash(
                        "error_msg",
                        "Please select a valid organisations!"
                      );
                      res.redirect(
                        process.env.PUBLIC_ADDRESS +
                          "/food-collections/log/" +
                          req.params.key
                      );
                    }
                  });
                } else {
                  req.flash(
                    "error_msg",
                    "Please select a collection and drop-off organisation!"
                  );
                  res.redirect(
                    process.env.PUBLIC_ADDRESS +
                      "/food-collections/log/" +
                      req.params.key
                  );
                }
              } else {
                req.flash(
                  "error_msg",
                  "Something went wrong! Please <a href='" +
                    process.env.PUBLIC_ADDRESS +
                    "/support'>contact support</a>"
                );
                res.redirect(
                  process.env.PUBLIC_ADDRESS +
                    "/food-collections/log/" +
                    req.params.key
                );
              }
            }
          );
        } else {
          res.render("error", {
            title: "Invalid Link",
            specificError: {
              title: "Invalid Link",
              message:
                "Your link isn't valid! Please get in touch with your co-ordinator."
            }
          });
        }
      } else {
        res.render("error", {
          title: "Invalid Link",
          specificError: {
            title: "Invalid Link",
            message:
              "Your link has been disabled! Please get in touch with your co-ordinator."
          }
        });
      }
    } else {
      res.render("error", {
        title: "Invalid Link",
        specificError: {
          title: "Invalid Link",
          message:
            "Your link isn't valid! Please get in touch with your co-ordinator."
        }
      });
    }
  });
});

module.exports = router;
