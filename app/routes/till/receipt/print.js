// /till/report

var router = require("express").Router();
var async = require("async");

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");
var Tills = Models.Tills;
var Transactions = Models.Transactions;
var StockCategories = Models.StockCategories;
var Members = Models.Members;
var Carbon = Models.Carbon;
var CarbonCategories = Models.CarbonCategories;

var Helpers = require(rootDir + "/app/helper-functions/root");
var Auth = require(rootDir + "/app/configs/auth");

router.get(
  "/:transaction_id",
  Auth.isLoggedIn,
  Auth.canAccessPage("tills", "processTransaction"),
  function(req, res) {
    var carbon = {};
    Transactions.getById(req.params.transaction_id, function(err, transaction) {
      if (!err && transaction) {
        Tills.getById(transaction.till_id, function(err, till) {
          if (!err && till) {
            if (
              req.user.permissions.tills.processTransaction == true ||
              (req.user.permissions.tills.processTransaction ==
                "commonWorkingGroup" &&
                req.user.working_groups.includes(till.group_id))
            ) {
              Carbon.getByFxId(transaction.transaction_id, function(
                err,
                simpleCarbon
              ) {
                CarbonCategories.getAll(function(err, carbonCategories) {
                  Helpers.calculateCarbon(
                    simpleCarbon,
                    carbonCategories,
                    function(carbonSaved) {
                      carbon.savedThisTransaction = Math.abs(
                        (carbonSaved * 1e-3).toFixed(2)
                      );
                      Members.getAll(function(err, members, membersObj) {
                        StockCategories.getCategoriesByTillId(
                          transaction.till_id,
                          "tree",
                          function(err, categories) {
                            var flatCategories = Helpers.flatten(categories);
                            Transactions.formatTransactions(
                              [transaction],
                              membersObj,
                              flatCategories,
                              transaction.till_id,
                              function(formattedTransactions) {
                                var formattedTransaction =
                                  formattedTransactions[0];

                                formattedTransaction.carbon = carbon;
                                res.render("till/receipt", {
                                  layout: "",
                                  title: "Receipt",
                                  transaction: formattedTransaction
                                });
                              }
                            );
                          }
                        );
                      });
                    }
                  );
                });
              });
            } else {
              res.render("till/receipt", {
                layout: "",
                title: "Receipt",
                transaction: {}
              });
            }
          } else {
            res.render("till/receipt", {
              layout: "",
              title: "Receipt",
              transaction: {}
            });
          }
        });
      } else {
        res.render("till/receipt", {
          layout: "",
          title: "Receipt",
          transaction: {}
        });
      }
    });
  }
);

module.exports = router;
