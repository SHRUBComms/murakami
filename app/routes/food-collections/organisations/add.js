// /food-collections/organisations/add

var router = require("express").Router();
var async = require("async");

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");
var FoodCollections = Models.FoodCollections;
var FoodCollectionsOrganisations = Models.FoodCollectionsOrganisations;

var Helpers = require(rootDir + "/app/helper-functions/root");
var Auth = require(rootDir + "/app/configs/auth");

router.get(
  "/",
  Auth.isLoggedIn,
  Auth.canAccessPage("foodCollections", "addOrganisations"),
  function(req, res) {
    res.render("food-collections/organisations/add", {
      title: "Add Food Collection Organisations",
      foodCollectionsActive: true
    });
  }
);

router.post(
  "/",
  Auth.isLoggedIn,
  Auth.canAccessPage("foodCollections", "addOrganisations"),
  function(req, res) {
    var organisation = req.body.organisation;
    var formattedOrganisation = {};
    if (organisation.name) {
      formattedOrganisation.name = organisation.name;

      var validTypes = ["drop-offs", "collections"];

      if (!Array.isArray(organisation.type)) {
        organisation.type = [organisation.type];
      }

      if (Helpers.allBelongTo(organisation.type, validTypes)) {
        formattedOrganisation.type = organisation.type;
      } else {
        formattedOrganisation.type = [];
      }

      if (formattedOrganisation.type.length > 0) {
        FoodCollectionsOrganisations.add(formattedOrganisation, function(
          err,
          organisation_id
        ) {
          if (!err) {
            req.flash("success_msg", "Organisation successfully added!");
            res.redirect(
              process.env.PUBLIC_ADDRESS +
                "/food-collections/organisations/view/" +
                organisation_id
            );
          } else {
            res.render("food-collections/organisations/add", {
              errors: [{ msg: "Something went wrong!" }],
              title: "Add Food Collection Organisations",
              foodCollectionsActive: true,
              organisation: organisation
            });
          }
        });
      } else {
        res.render("food-collections/organisations/add", {
          errors: [{ msg: "Please select this organisations type!" }],
          title: "Add Food Collection Organisations",
          foodCollectionsActive: true,
          organisation: organisation
        });
      }
    } else {
      res.render("food-collections/organisations/add", {
        errors: [{ msg: "Please enter a name!" }],
        title: "Add Food Collection Organisations",
        foodCollectionsActive: true,
        organisation: organisation
      });
    }
  }
);

module.exports = router;
