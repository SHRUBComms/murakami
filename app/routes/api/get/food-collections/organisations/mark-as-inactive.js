// /api/get/food-collections/organisations/mark-as-inactive

var router = require("express").Router();

var rootDir = process.env.CWD;

var FoodCollections = require(rootDir + "/app/models/food-collections");

var Auth = require(rootDir + "/app/configs/auth");

router.get(
  "/:organisation_id",
  Auth.isLoggedIn,
  Auth.canAccessPage("foodCollections", "updateOrganisations"),
  function(req, res) {
    FoodCollections.getOrganisationById(req.params.organisation_id, function(
      err,
      organisation
    ) {
      if (organisation) {
        var redirectAddr =
          process.env.PUBLIC_ADDRESS +
          "/food-collections/organisations/view/" +
          organisation.organisation_id;
        if (organisation.active == 1) {
          FoodCollections.updateOrganisationActiveStatus(
            organisation.organisation_id,
            0,
            function() {
              if (!err) {
                req.flash(
                  "success_msg",
                  organisation.name + " marked as inactive!"
                );
                res.redirect(redirectAddr);
              } else {
                req.flash("error_msg", "Something went wrong!");
                res.redirect(redirectAddr);
              }
            }
          );
        } else {
          req.flash("error_msg", organisation.name + " is already inactive!");
          res.redirect(redirectAddr);
        }
      } else {
        res.redirect(
          process.env.PUBLIC_ADDRESS + "/food-collections/organisations/manage"
        );
      }
    });
  }
);

module.exports = router;
