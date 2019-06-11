// /api/get/members/remote-add

var router = require("express").Router();
var async = require("async");
var request = require("request");

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");
var Tills = Models.Tills;
var Transactions = Models.Transactions;
var StockCategories = Models.StockCategories;

var Auth = require(rootDir + "/app/configs/auth");

router.post("/", function(req, res) {
  StockCategories.getMembershipCategories(function(err, membershipCategories) {
    if (!err) {
      res.send({ status: "ok", membershipCategories: membershipCategories });
    } else {
      res.send({
        status: "fail",
        msg: "Something went wrong retreiving membership categories."
      });
    }
  });
});

module.exports = router;
