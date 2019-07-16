// /api/get/members/transactions

var router = require("express").Router();
var async = require("async");
var moment = require("moment");
moment.locale("en-gb");

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");

var Tills = Models.Tills;
var Transactions = Models.Transactions;
var StockCategories = Models.StockCategories;
var Members = Models.Members;
var CarbonCategories = Models.CarbonCategories;

var Auth = require(rootDir + "/app/configs/auth");
var Helpers = require(rootDir + "/app/helper-functions/root");

router.get(
  "/:member_id",
  Auth.isLoggedIn,
  Auth.canAccessPage("members", "transactionHistory"),
  function(req, res) {
    Members.getById(req.params.member_id, req.user, function(err, member) {
      if (!err && member.transactionHistory) {
        Transactions.getByMemberId(req.params.member_id, function(
          err,
          transactions
        ) {
          if (transactions.length > 0) {
            StockCategories.getCategories("tree", function(err, categories) {
              CarbonCategories.getAll(function(err, carbonCategories) {
                var flatCategories = Helpers.flatten(categories);

                Transactions.formatTransactions(
                  transactions,
                  { [member.member_id]: { member } },
                  flatCategories,
                  req.params.till_id,
                  function(formattedTransactions) {
                    res.send(formattedTransactions);
                  }
                );
              });
            });
          } else {
            res.send([]);
          }
        });
      } else {
        res.send([]);
      }
    });
  }
);

module.exports = router;
