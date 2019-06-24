// /api/post/tills/reports/unit-sales

var router = require("express").Router();

var async = require("async");
var lodash = require("lodash");
var moment = require("moment");
moment.locale("en-gb");

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");
var Tills = Models.Tills;
var Transactions = Models.Transactions;
var StockCategories = Models.StockCategories;

var Auth = require(rootDir + "/app/configs/auth");
var Helpers = require(rootDir + "/app/helper-functions/root");

router.post("/", Auth.isLoggedIn, function(req, res) {
  var response = { status: "fail", msg: "Something went wrong!" };

  var till_id = req.body.till_id;
  var datePeriod = req.body.datePeriod || "today";
  var startDate, endDate;

  var unitSales = {};

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
                StockCategories.getCategoriesByTillId(till_id, "tree", function(
                  err,
                  categories
                ) {
                  var flatCategories = Helpers.flatten(categories);
                  var flatCategoriesAsObj = {};
                  async.each(
                    flatCategories,
                    function(category, callback) {
                      flatCategoriesAsObj[category.item_id] = category;
                      unitSales[category.item_id] = {
                        salesInfo: {
                          totalSales: 0,
                          totalRevenue: 0,
                          boughtByMember: 0,
                          boughtByNonMember: 0,
                          memberRatio: 0
                        },
                        categoryInfo: category
                      };

                      try {
                        if (category.group_id) {
                          if (req.user.allWorkingGroupsObj[category.group_id]) {
                            unitSales[category.item_id].categoryInfo.groupName =
                              req.user.allWorkingGroupsObj[category.group_id]
                                .name || "-";
                          }
                        }
                      } catch (err) {
                        console.log(err);
                        unitSales[category.item_id].categoryInfo.groupName =
                          "-";
                      }

                      callback();
                    },
                    function() {
                      async.each(
                        transactions,
                        function(transaction, callback) {
                          if (
                            ![
                              "membership",
                              "donation",
                              "volunteering"
                            ].includes(transaction.summary.bill[0].item_id)
                          ) {
                            async.each(
                              transaction.summary.bill,
                              function(item, callback) {
                                if (flatCategoriesAsObj[item.item_id]) {
                                  unitSales[
                                    item.item_id
                                  ].salesInfo.totalSales += 1;
                                  unitSales[
                                    item.item_id
                                  ].salesInfo.totalRevenue +=
                                    item.value || item.tokens || 0;

                                  unitSales[
                                    item.item_id
                                  ].salesInfo.totalRevenue = unitSales[
                                    item.item_id
                                  ].salesInfo.totalRevenue.toFixed(2);

                                  if (transaction.member != "anon") {
                                    unitSales[
                                      item.item_id
                                    ].salesInfo.boughtByMember += 1;
                                  }

                                  unitSales[
                                    item.item_id
                                  ].salesInfo.memberRatio =
                                    (unitSales[item.item_id].salesInfo
                                      .boughtByMember /
                                      unitSales[item.item_id].salesInfo
                                        .totalSales) *
                                      100 || 0;
                                }
                                callback();
                              },
                              function() {
                                callback();
                              }
                            );
                          } else {
                            callback();
                          }
                        },
                        function() {
                          response.status = "ok";
                          delete response.msg;
                          response.unitSales = lodash.values(unitSales);
                          res.send(response);
                        }
                      );
                    }
                  );
                });
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
