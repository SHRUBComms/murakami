// /api/get/members/carbon-saved

var router = require("express").Router();
var async = require("async");

var rootDir = process.env.CWD;

var Members = require(rootDir + "/app/models/members");

var Carbon = require(rootDir + "/app/models/carbon-calculations");

var Auth = require(rootDir + "/app/configs/auth");
var Helpers = require(rootDir + "/app/configs/helpful_functions");

router.get("/:member_id", Auth.isLoggedIn, function(req, res) {
  Carbon.getByMemberId(req.params.member_id, function(err, carbon) {
    if (err || carbon.length == 0) {
      res.send({ carbon: 0 });
    } else {
      Carbon.getCategories(function(err, carbonCategoriesRaw) {
        Helpers.calculateCarbon(carbon, carbonCategoriesRaw, function(
          totalCarbon
        ) {
          res.send({ carbon: Math.abs(totalCarbon.toFixed(2)) });
        });
      });
    }
  });
});

module.exports = router;
