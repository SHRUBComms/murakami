// /api/post/tills/reports/transactions

var router = require("express").Router();

var async = require("async");
var moment = require("moment");
moment.locale("en-gb");

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");
var Tills = Models.Tills;
var Transactions = Models.Transactions;
var Members = Models.Members;
var StockCategories = Models.StockCategories;

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
                if (transactions.length > 0) {
                  Members.getAll(function(err, members, membersObj) {
                    StockCategories.getCategoriesByTillId(
                      till_id,
                      "tree",
                      function(err, categories) {
                        var flatCategories = Helpers.flatten(categories);

                        var flatCategoriesAsObj = {};
                        Transactions.formatTransactions(
                          transactions,
                          membersObj,
                          flatCategories,
                          till_id,
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
