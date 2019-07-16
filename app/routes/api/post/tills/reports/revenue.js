// /api/post/tills/reports/revenue

var router = require("express").Router();

var async = require("async");
var moment = require("moment");
moment.locale("en-gb");

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");
var Tills = Models.Tills;
var Transactions = Models.Transactions;
var StockCategories = Models.StockCategories;

var Auth = require(rootDir + "/app/configs/auth");
var Helpers = require(rootDir + "/app/helper-functions/root");

router.post("/", Auth.verifyByKey, function(req, res) {
  var response = { status: "fail", msg: "Something went wrong!", summary: {} };

  var startDate, endDate;
  try {
    startDate = moment(req.body.startDate)
      .startOf("day")
      .toDate();
  } catch (err) {
    startDate = moment()
      .startOf("day")
      .toDate();
  }

  try {
    endDate = moment(req.body.endDate)
      .endOf("day")
      .toDate();
  } catch (err) {
    endDate = moment()
      .endOf("day")
      .toDate();
  }

  var tills = req.body.tills;
  var workingGroups = req.body.workingGroups;

  if (workingGroups) {
    if (!Array.isArray(workingGroups)) {
      workingGroups = [workingGroups];
    }
  } else if (tills) {
    if (!Array.isArray(tills)) {
      tills = [tills];
    }
  } else {
    workingGroups = [];
    tills = [];
  }

  console.log("Start Date:", startDate);
  console.log("End Date:", endDate);
  console.log("Working Groups:", workingGroups);
  console.log("Tills", tills);

  Tills.getAll(function(err, tillsArray, allTillsObj) {
    StockCategories.getAllCategories(function(err, allCategoriesObj) {
      Transactions.getAllBetweenTwoDates(startDate, endDate, function(
        err,
        transactions
      ) {
        response.summary.revenue = {
          total: 0,
          breakdown: {
            card: 0,
            cash: 0
          }
        };

        response.summary.byGroup = {};
        response.summary.byTill = {};

        console.log("No. transactions:", transactions.length);
        async.each(
          transactions,
          function(transaction, callback) {
            if (transaction.till_id) {
              if (allTillsObj[transaction.till_id]) {
                if (transaction.summary) {
                  if (transaction.summary.paymentMethod) {
                    if (transaction.summary.bill) {
                      if (transaction.summary.totals.money > 0) {
                        if (transaction.summary.bill[0]) {
                          if (transaction.summary.bill[0].item_id) {
                            if (
                              ![
                                "membership",
                                "donation",
                                "volunteering"
                              ].includes(transaction.summary.bill[0].item_id)
                            ) {
                              transaction.addedToTotal = false;
                              if (tills.includes(transaction.till_id)) {
                                let transactionValue =
                                  transaction.summary.totals.money;

                                if (
                                  response.summary.byTill[
                                    transaction.till_id
                                  ] === undefined
                                ) {
                                  response.summary.byTill[
                                    transaction.till_id
                                  ] = {
                                    total: 0,
                                    breakdown: {
                                      card: 0,
                                      cash: 0
                                    }
                                  };
                                }

                                response.summary.revenue.total += +transactionValue;
                                addedToTotal = true;

                                response.summary.byTill[
                                  transaction.till_id
                                ].total += +transactionValue;

                                if (
                                  response.summary.revenue.breakdown[
                                    transaction.summary.paymentMethod
                                  ] !== undefined
                                ) {
                                  response.summary.revenue.breakdown[
                                    transaction.summary.paymentMethod
                                  ] += +transactionValue;
                                }

                                if (
                                  response.summary.byTill[transaction.till_id]
                                    .breakdown[
                                    transaction.summary.paymentMethod
                                  ] !== undefined
                                ) {
                                  response.summary.byTill[
                                    transaction.till_id
                                  ].breakdown[
                                    transaction.summary.paymentMethod
                                  ] += +transactionValue;
                                }
                              }

                              async.each(
                                transaction.summary.bill,
                                function(item, callback) {
                                  if (allCategoriesObj[item.item_id]) {
                                    if (
                                      workingGroups.includes(
                                        allCategoriesObj[item.item_id].group_id
                                      ) ||
                                      workingGroups.includes(
                                        allTillsObj[transaction.till_id]
                                          .group_id
                                      )
                                    ) {
                                      let group_id =
                                        allCategoriesObj[item.item_id]
                                          .group_id ||
                                        allTillsObj[transaction.till_id]
                                          .group_id;

                                      if (!response.summary.byGroup[group_id]) {
                                        response.summary.byGroup[group_id] = {
                                          total: 0,
                                          breakdown: {
                                            card: 0,
                                            cash: 0
                                          }
                                        };
                                      }

                                      let itemValue =
                                        (+item.value || +item.tokens) *
                                        (item.quantity || 1);

                                      if (transaction.addedToTotal == false) {
                                        response.summary.revenue.total += +itemValue;
                                        transaction.addedToTotal = true;
                                      }

                                      response.summary.byGroup[
                                        group_id
                                      ].total += +itemValue;

                                      if (
                                        response.summary.revenue.breakdown[
                                          transaction.summary.paymentMethod
                                        ] !== undefined
                                      ) {
                                        response.summary.revenue.breakdown[
                                          transaction.summary.paymentMethod
                                        ] += itemValue;
                                      }

                                      if (
                                        response.summary.byGroup[group_id]
                                          .breakdown[
                                          transaction.summary.paymentMethod
                                        ] !== undefined
                                      ) {
                                        response.summary.byGroup[
                                          group_id
                                        ].breakdown[
                                          transaction.summary.paymentMethod
                                        ] += +itemValue;
                                      }
                                    }
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
            res.send(response);
          }
        );
      });
    });
  });
});

module.exports = router;
