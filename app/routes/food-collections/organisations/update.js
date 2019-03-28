// /food-collections/organisations/update

var router = require("express").Router();
var async = require("async");

var rootDir = process.env.CWD;

var FoodCollections = require(rootDir + "/app/models/food-collections");

var Auth = require(rootDir + "/app/configs/auth");

router.get("/:organisation_id", Auth.isLoggedIn, function(req, res) {
  FoodCollections.getOrganisationById(req.params.organisation_id, function(
    err,
    organisation
  ) {
    if (organisation) {
      res.render("food-collections/organisations/update", {
        title: "Update Food Collection Organisation",
        foodCollectionsActive: true,
        organisation: organisation
      });
    } else {
      res.redirect(
        process.env.PUBLIC_ADDRESS + "/food-collections/organisations/manage"
      );
    }
  });
});

router.post("/:organisation_id", Auth.isLoggedIn, function(req, res) {
  FoodCollections.getOrganisationById(req.params.organisation_id, function(
    err,
    organisationFound
  ) {
    if (organisationFound) {
      var organisation = req.body.organisation;
      var formattedOrganisation = {
        organisation_id: req.params.organisation_id
      };
      if (organisation.name) {
        formattedOrganisation.name = organisation.name;
        FoodCollections.updateOrganisation(formattedOrganisation, function(
          err
        ) {
          if (!err) {
            req.flash("success_msg", "Organisation successfully updated!");
            res.redirect(
              process.env.PUBLIC_ADDRESS +
                "/food-collections/organisations/view/" +
                req.params.organisation_id
            );
          } else {
            
            res.render("food-collections/organisations/update", {
              errors: [{ msg: "Something went wrong!" }],
              title: "Update Food Collection Organisations",
              foodCollectionsActive: true,
              organisation: organisationFound
            });
          }
        });
      } else {
        res.render("food-collections/organisations/update", {
          errors: [{ msg: "Please enter a name!" }],
          title: "View Food Collection Organisations",
          foodCollectionsActive: true,
          organisation: organisationFound
        });
      }
    } else {
      req.flash("error_msg", "Organisation doesn't exist!");
      res.redirect(
        process.env.PUBLIC_ADDRESS + "/food-collections/organisations/manage"
      );
    }
  });
});

module.exports = router;
