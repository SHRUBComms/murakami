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

var LogFoodCollection = require(rootDir +
  "/app/controllers/food-collections/log");

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
    LogFoodCollection(req, res, null, function(err) {
      if (!err) {
        req.flash("success_msg", "Collection & shift successfully logged!");
        res.redirect(process.env.PUBLIC_ADDRESS + "/food-collections/log");
      } else {
        req.flash("error_msg", err);
        res.redirect(process.env.PUBLIC_ADDRESS + "/food-collections/log");
      }
    });
  }
);

router.post("/:key", Auth.isNotLoggedIn, function(req, res) {
  FoodCollectionsKeys.getById(req.params.key, function(err, foodCollectionKey) {
    if (!err && foodCollectionKey) {
      if (foodCollectionKey.active == 1) {
        LogFoodCollection(req, res, foodCollectionKey, function(err) {
          if (!err) {
            req.flash("success_msg", "Collection & shift successfully logged!");
            res.redirect(
              process.env.PUBLIC_ADDRESS +
                "/food-collections/log/" +
                req.params.key
            );
          } else {
            req.flash("error_msg", err);
            res.redirect(
              process.env.PUBLIC_ADDRESS +
                "/food-collections/log/" +
                req.params.key
            );
          }
        });
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
