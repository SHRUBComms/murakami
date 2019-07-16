// /api/get/tills/transactions

var router = require("express").Router();
var async = require("async");
var moment = require("moment");
moment.locale("en-gb");

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");
var Tills = Models.Tills;
var StockCategories = Models.StockCategories;
var TillActivity = Models.TillActivity;
var Transactions = Models.Transactions;
var Members = Models.Members;

var Auth = require(rootDir + "/app/configs/auth");
var Helpers = require(rootDir + "/app/helper-functions/root");

router.get("/:till_id", Auth.isLoggedIn, function(req, res) {
  Tills.getById(req.params.till_id, function(err, till) {
    if (till) {
      TillActivity.getByTillId(req.params.till_id, function(status) {
        if (status.opening == 1 || req.query.startDate) {
          Transactions.getAllBetweenTwoDatesByTillId(
            req.params.till_id,
            req.query.startDate || status.timestamp,
            req.query.endDate || new Date(),
            function(err, transactions) {
              if (transactions.length > 0) {
                Members.getAll(function(err, members, membersObj) {
                  StockCategories.getCategoriesByTillId(
                    req.params.till_id,
                    "tree",
                    function(err, categories) {
                      var flatCategories = Helpers.flatten(categories);

                      var flatCategoriesAsObj = {};
                      Transactions.formatTransactions(
                        transactions,
                        membersObj,
                        flatCategories,
                        req.params.till_id,
                        function(formattedTransactions) {
                          res.send(formattedTransactions);
                        }
                      );
                    }
                  );
                });
              } else {
                res.send([]);
              }
            }
          );
        } else {
          res.send([]);
        }
      });
    } else {
      res.send([]);
    }
  });
});

module.exports = router;
