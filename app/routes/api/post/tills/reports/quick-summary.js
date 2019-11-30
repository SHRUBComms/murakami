// /api/post/tills/reports/quick-summary

var router = require("express").Router();

var async = require("async");
var moment = require("moment");
moment.locale("en-gb");

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");
var Tills = Models.Tills;
var Transactions = Models.Transactions;

var Auth = require(rootDir + "/app/configs/auth");
var Helpers = require(rootDir + "/app/helper-functions/root");

router.post("/", Auth.isLoggedIn, function(req, res) {
  var response = { status: "fail", msg: "Something went wrong!", summary: {} };

  var till_id = req.body.till_id;
  var datePeriod = req.body.datePeriod || "today";

  var startDate = req.body.startDate || null;
  var endDate = req.body.endDate || null;

  if (till_id) {
    Tills.getById(till_id, function(err, till) {
      if (till) {
        Helpers.plainEnglishDateRangeToDates(
          datePeriod,
          startDate,
          endDate,
          function(startDate, endDate) {
            Transactions.getAllBetweenTwoDatesByTillId(
              till_id,
              startDate,
              endDate,
              function(err, transactions) {
                response.summary.numberOfTransactions = transactions.length;
                response.summary.revenue = {
                  total: 0,
                  breakdown: {
                    card: 0,
                    cash: 0,
                    unknown: 0
                  }
                };

                response.summary.tokens = {
                  spent: 0,
                  issued: 0
                };

                async.each(
                  transactions,
                  function(transaction, callback) {
                    if (
                      [
                        "membership",
                        "donation",
                        "volunteering",
                        "refund"
                      ].includes(transaction.summary.bill[0].item_id)
                    ) {
                      response.summary.tokens.issued += +transaction.summary
                        .totals.tokens;
                    } else {
                      if (transaction.summary.totals.money > 0) {
                        response.summary.revenue.total += +transaction.summary
                          .totals.money;

                        if (transaction.summary.paymentMethod == "cash") {
                          response.summary.revenue.breakdown.cash += +transaction
                            .summary.totals.money;
                        } else if (
                          transaction.summary.paymentMethod == "card" &&
                          transaction.summary.sumupId
                        ) {
                          response.summary.revenue.breakdown.card += +transaction
                            .summary.totals.money;
                        }
                      }

                      if (transaction.summary.totals.tokens > 0) {
                        response.summary.tokens.spent += +transaction.summary
                          .totals.tokens;
                      }
                    }

                    callback();
                  },
                  function() {
                    response.status = "ok";
                    delete response.msg;
                    res.send(response);
                  }
                );
              }
            );
          }
        );
      } else {
        response.msg = "No valid till selected.";
        res.send(response);
      }
    });
  } else {
    response.msg = "No till selected.";
    res.send(response);
  }
});

module.exports = router;
