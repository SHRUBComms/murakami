// /food-collections/organisations/add

var router = require("express").Router();
var async = require("async");

var rootDir = process.env.CWD;

var FoodCollections = require(rootDir + "/app/models/food-collections");

var Auth = require(rootDir + "/app/configs/auth");

router.get("/", Auth.isLoggedIn, function(req, res) {
  res.render("food-collections/organisations/add", {
    title: "Add Food Collection Organisations",
    foodCollectionsActive: true
  });
});

router.post("/", Auth.isLoggedIn, function(req, res) {
  var organisation = req.body.organisation;
  var formattedOrganisation = {};
  if (organisation.name) {
    formattedOrganisation.name = organisation.name;
    FoodCollections.addOrganisation(formattedOrganisation, function(
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
        console.log(err);
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
      errors: [{ msg: "Please enter a name!" }],
      title: "Add Food Collection Organisations",
      foodCollectionsActive: true,
      organisation: organisation
    });
  }
});

module.exports = router;
