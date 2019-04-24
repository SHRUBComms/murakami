// /api/get/members/carbon-saved

var router = require("express").Router();

var rootDir = process.env.CWD;

var Carbon = require(rootDir + "/app/models/carbon-calculations");
var Members = require(rootDir + "/app/models/members");

var Auth = require(rootDir + "/app/configs/auth");
var Helpers = require(rootDir + "/app/configs/helpful_functions");

router.get(
  "/:member_id",
  Auth.isLoggedIn,
  Auth.canAccessPage("members", "carbonSaved"),
  function(req, res) {
    Members.getById(req.params.member_id, req.user, function(err, member) {
      
      if (member.canViewSavedCarbon) {
        Carbon.getByMemberId(req.params.member_id, function(err, carbon) {
          if (err || carbon.length == 0) {
            res.send({ carbon: 0 });
          } else {
            Carbon.getCategories(function(err, carbonCategoriesRaw) {
              Helpers.calculateCarbon(carbon, carbonCategoriesRaw, function(
                totalCarbon
              ) {
                res.send({ carbon: Math.abs(totalCarbon.toFixed(2)) || 0 });
              });
            });
          }
        });
      } else {
        res.send({ carbon: 0 });
      }
    });
  }
);

module.exports = router;
