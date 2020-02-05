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

router.post(
  "/",
  Auth.isLoggedIn,
  Auth.canAccessPage("tills", "viewReports"),
  function(req, res) {
    var response = {
      status: "fail",
      msg: "Something went wrong!"
    };

    var till_id = req.body.till_id;
    var datePeriod = req.body.datePeriod || "today";
    var startDate = req.body.startDate || null;
    var endDate = req.body.endDate || null;

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
                  StockCategories.getCategories("tree", function(
                    err,
                    categories
                  ) {
                    var flatCategories = Helpers.flatten(categories);
                    var flatCategoriesAsObj = {};
                    async.each(
                      flatCategories,
                      function(category, callback) {
                        flatCategoriesAsObj[category.item_id] = category;

                        try {
                          if (flatCategoriesAsObj[category.item_id].group_id) {
                            if (
                              req.user.allWorkingGroupsObj[
                                flatCategoriesAsObj[category.item_id].group_id
                              ]
                            ) {
                              flatCategoriesAsObj[category.item_id].groupName =
                                req.user.allWorkingGroupsObj[
                                  flatCategoriesAsObj[category.item_id].group_id
                                ].name || "-";
                            }
                          }
                        } catch (err) {
                          categoryInfo.groupName = "-";
                        }

                        callback();
                      },
                      function() {
                        async.each(
                          transactions,
                          function(transaction, callback) {
                            if (transaction.summary.bill) {
                              if (transaction.summary.bill.length > 0) {
                                if (
                                  ![
                                    "membership",
                                    "donation",
                                    "volunteering",
                                    "refund"
                                  ].includes(
                                    transaction.summary.bill[0].item_id
                                  )
                                ) {
                                  if (
                                    (transaction.summary.paymentMethod ==
                                      "card" &&
                                      transaction.summary.sumupId) ||
                                    transaction.summary.paymentMethod == "cash"
                                  ) {
                                    if (
                                      transaction.summary.totals.money > 0 ||
                                      transaction.summary.totals.tokens > 0
                                    ) {
                                      async.each(
                                        transaction.summary.bill,
                                        function(item, callback) {
                                          if (
                                            flatCategoriesAsObj[item.item_id]
                                          ) {
                                            if (item.condition) {
                                              flatCategoriesAsObj[
                                                item.item_id +
                                                  "_" +
                                                  item.condition
                                              ] = lodash.cloneDeep(
                                                flatCategoriesAsObj[
                                                  item.item_id
                                                ]
                                              );
                                              item.item_id +=
                                                "_" + item.condition;

                                              flatCategoriesAsObj[
                                                item.item_id
                                              ].absolute_name +=
                                                " (" +
                                                lodash.startCase(
                                                  item.condition
                                                ) +
                                                ")";
                                            }

                                            if (!unitSales[item.item_id]) {
                                              if (
                                                flatCategoriesAsObj[
                                                  item.item_id
                                                ].group_id
                                              ) {
                                                flatCategoriesAsObj[
                                                  item.item_id
                                                ].groupName =
                                                  req.user.allWorkingGroupsObj[
                                                    flatCategoriesAsObj[
                                                      item.item_id
                                                    ].group_id
                                                  ].name || "-";
                                              }

                                              unitSales[item.item_id] = {
                                                salesInfo: {
                                                  totalSales: 0,
                                                  totalRevenue: 0,
                                                  boughtByMember: 0,
                                                  boughtByNonMember: 0,
                                                  memberRatio: 0
                                                },
                                                categoryInfo:
                                                  flatCategoriesAsObj[
                                                    item.item_id
                                                  ]
                                              };

                                              unitSales[
                                                item.item_id
                                              ].categoryInfo.name =
                                                flatCategoriesAsObj[
                                                  item.item_id
                                                ].absolute_name ||
                                                flatCategoriesAsObj[
                                                  item.item_id
                                                ].name;
                                            }

                                            try {
                                              unitSales[
                                                item.item_id
                                              ].salesInfo.totalSales += +(
                                                parseInt(item.quantity) || 1
                                              );
                                            } catch (err) {
                                              unitSales[
                                                item.item_id
                                              ].salesInfo.totalSales += +1;
                                            }

                                            unitSales[
                                              item.item_id
                                            ].salesInfo.totalRevenue = parseFloat(
                                              parseFloat(
                                                unitSales[item.item_id]
                                                  .salesInfo.totalRevenue
                                              ) +
                                                (parseFloat(item.value) ||
                                                  parseFloat(item.tokens) ||
                                                  0)
                                            ).toFixed(2);

                                            if (
                                              transaction.member_id != "anon"
                                            ) {
                                              unitSales[
                                                item.item_id
                                              ].salesInfo.boughtByMember += +1;
                                            }

                                            unitSales[
                                              item.item_id
                                            ].salesInfo.memberRatio = (
                                              (unitSales[item.item_id].salesInfo
                                                .boughtByMember /
                                                unitSales[item.item_id]
                                                  .salesInfo.totalSales) *
                                                100 || 0
                                            ).toFixed(2);
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
                                  } else {
                                    callback();
                                  }
                                } else {
                                  callback();
                                }
                              } else {
                                callback();
                              }
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
  }
);

module.exports = router;
