// /api/get/food-collections/organisations/mark-as-active

var router = require("express").Router();

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");

var FoodCollectionsOrganisations = Models.FoodCollectionsOrganisations;

var Auth = require(rootDir + "/app/configs/auth");

router.get(
  "/:organisation_id",
  Auth.isLoggedIn,
  Auth.canAccessPage("foodCollections", "updateOrganisations"),
  function(req, res) {
    FoodCollectionsOrganisations.getById(req.params.organisation_id, function(
      err,
      organisation
    ) {
      if (organisation) {
        var redirectAddr =
          process.env.PUBLIC_ADDRESS +
          "/food-collections/organisations/view/" +
          organisation.organisation_id;
        if (organisation.active == 0) {
          FoodCollectionsOrganisations.updateActiveStatus(
            organisation.organisation_id,
            1,
            function() {
              if (!err) {
                req.flash(
                  "success_msg",
                  organisation.name + " marked as active!"
                );
                res.redirect(redirectAddr);
              } else {
                req.flash("error_msg", "Something went wrong!");
                res.redirect(redirectAddr);
              }
            }
          );
        } else {
          req.flash("error_msg", organisation.name + " is already active!");
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
