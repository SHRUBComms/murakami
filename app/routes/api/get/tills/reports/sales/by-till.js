// /api/get/tills/reports/sales/by-till

var router = require("express").Router();
var async = require("async");
var moment = require("moment");
moment.locale("en-gb");

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");
var Tills = Models.Tills;
var StockCategories = Models.StockCategories;
var Transactions = Models.Transactions;

var Auth = require(rootDir + "/app/configs/auth");
var Helpers = require(rootDir + "/app/configs/helpful_functions");

router.get("/:till_id", Auth.verifyByKey, function(req, res) {
  var startDate;
  var endDate;
  var condition = req.query.condition || null;
  var item_id = req.query.item_id || null;
  try {
    startDate =
      moment(req.query.startDate).format("YYYY-MM-DD") ||
      moment().format("YYYY-MM-DD");
  } catch (err) {
    startDate = moment().format("YYYY-MM-DD");
  }

  try {
    endDate =
      moment(req.query.endDate).format("YYYY-MM-DD") ||
      moment().format("YYYY-MM-DD");
  } catch (err) {
    endDate = moment().format("YYYY-MM-DD");
  }

  var revenue = {
    total: 0,
    breakdown: {
      cash: 0,
      card: 0
    }
  };

  Tills.getById(req.params.till_id, function(err, till) {
    if (till) {
      Transactions.getAllBetweenTwoDatesByTillId(
        till.till_id,
        startDate,
        endDate,
        function(err, transactions) {
          StockCategories.getDonationCategories(function(
            err,
            donationCategories
          ) {
            StockCategories.getMembershipCategories(function(
              err,
              membershipCategories
            ) {
              async.each(
                transactions,
                function(transaction, callback) {
                  transaction.summary = JSON.parse(transaction.summary);

                  if (
                    !isNaN(transaction.summary.totals.money) &&
                    transaction.summary.totals.money > 0
                  ) {
                    async.each(
                      transaction.summary.bill,
                      function(item, callback) {
                        if (
                          membershipCategories[item.item_id] ||
                          donationCategories[item.item_id]
                        ) {
                          transaction.summary.totals.money =
                            transaction.summary.totals.money - item.tokens;
                        }
                        callback();
                      },
                      function() {
                        revenue.total += +transaction.summary.totals.money;

                        if (transaction.summary.paymentMethod == "cash") {
                          revenue.breakdown.cash += +transaction.summary.totals
                            .money;
                        } else if (
                          transaction.summary.paymentMethod == "card"
                        ) {
                          revenue.breakdown.card += +transaction.summary.totals
                            .money;
                        }
                        callback();
                      }
                    );
                  } else {
                    callback();
                  }
                },
                function() {
                  revenue.total = revenue.total.toFixed(2);
                  revenue.breakdown.cash = revenue.breakdown.cash.toFixed(2);
                  revenue.breakdown.card = revenue.breakdown.card.toFixed(2);
                  res.send(revenue);
                }
              );
            });
          });
        }
      );
    } else {
      res.send(revenue);
    }
  });
});

module.exports = router;
