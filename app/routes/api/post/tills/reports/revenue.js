// /api/post/tills/reports/revenue

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
var WorkingGroups = Models.WorkingGroups;

var Auth = require(rootDir + "/app/configs/auth");
var Helpers = require(rootDir + "/app/helper-functions/root");

router.get("/", Auth.verifyByKey("tillRevenue"), function(req, res) {
  WorkingGroups.getAll(function(
    err,
    allWorkingGroupsObj,
    allWorkingGroupsRaw,
    allWorkingGroupsArray
  ) {
    var response = {
      status: "fail",
      msg: "Something went wrong!",
      summary: {},
      workingGroups: allWorkingGroupsObj
    };

    var blankSummary = {
      total: 0,
      breakdown: {
        card: 0,
        cash: 0
      }
    };

    Tills.getAll(function(err, tillsArray, allTillsObj) {
      StockCategories.getAllCategories(function(err, allCategoriesObj) {
        Transactions.getAll(function(err, transactions) {
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
                                let monthKey = moment(transaction.date)
                                  .startOf("month")
                                  .format("YYYY-MM-DD");

                                if (response.summary[monthKey] === undefined) {
                                  response.summary[monthKey] = {};
                                  response.summary[
                                    monthKey
                                  ].revenue = lodash.cloneDeep(blankSummary);
                                  response.summary[monthKey].byGroup = {};
                                }

                                async.each(
                                  transaction.summary.bill,
                                  function(item, callback) {
                                    if (allCategoriesObj[item.item_id]) {
                                      var group_id;

                                      if (
                                        allWorkingGroupsArray.includes(
                                          allCategoriesObj[item.item_id]
                                            .group_id
                                        )
                                      ) {
                                        group_id =
                                          allCategoriesObj[item.item_id]
                                            .group_id;
                                      } else if (
                                        allWorkingGroupsArray.includes(
                                          allTillsObj[transaction.till_id]
                                            .group_id
                                        )
                                      ) {
                                        group_id =
                                          allTillsObj[transaction.till_id]
                                            .group_id;
                                      } else {
                                        group_id = null;
                                      }

                                      if (group_id !== null) {
                                        if (
                                          !response.summary[monthKey].byGroup[
                                            group_id
                                          ]
                                        ) {
                                          response.summary[monthKey].byGroup[
                                            group_id
                                          ] = lodash.cloneDeep(blankSummary);
                                        }

                                        let itemValue =
                                          parseFloat(
                                            (parseFloat(item.value) ||
                                              parseFloat(item.tokens)) *
                                              (parseInt(item.quantity) || 1)
                                          ) || 0;

                                        response.summary[
                                          monthKey
                                        ].revenue.total += +itemValue;
                                        if (
                                          response.summary[monthKey].revenue
                                            .breakdown[
                                            transaction.summary.paymentMethod
                                          ] !== undefined
                                        ) {
                                          response.summary[
                                            monthKey
                                          ].revenue.breakdown[
                                            transaction.summary.paymentMethod
                                          ] += +itemValue;
                                        }

                                        response.summary[monthKey].byGroup[
                                          group_id
                                        ].total += +itemValue;

                                        if (
                                          response.summary[monthKey].byGroup[
                                            group_id
                                          ].breakdown[
                                            transaction.summary.paymentMethod
                                          ] !== undefined
                                        ) {
                                          response.summary[monthKey].byGroup[
                                            group_id
                                          ].breakdown[
                                            transaction.summary.paymentMethod
                                          ] += +itemValue;
                                        }
                                        callback();
                                      } else {
                                        callback();
                                      }
                                    } else {
                                      callback();
                                    }
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
});

module.exports = router;
