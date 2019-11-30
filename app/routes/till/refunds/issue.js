// /till/refunds/issue

var router = require("express").Router();
var request = require("request");
var moment = require("moment");
moment.locale("en-gb");

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");
var Tills = Models.Tills;
var TillActivity = Models.TillActivity;
var Transactions = Models.Transactions;
var Members = Models.Members;
var StockCategories = Models.StockCategories;

var Auth = require(rootDir + "/app/configs/auth");
var Helpers = require(rootDir + "/app/helper-functions/root");

router.post(
  "/",
  Auth.isLoggedIn,
  Auth.canAccessPage("tills", "processRefunds"),
  function(req, res) {
    var till_id = req.body.tillId;
    var transaction_id = req.body.transactionId;
    var refund_type = req.body.refundType;
    var action = req.body.action;
    var amount = req.body.amount;
    var response = { status: "fail", transaction: {} };

    if (till_id) {
      if (transaction_id) {
        if (refund_type) {
          if (action) {
            if (action == "lookup" || (action == "issue" && !isNaN(amount))) {
              if (["sumup", "murakami"].includes(refund_type)) {
                Tills.getById(till_id, function(err, till) {
                  if (till && !err) {
                    if (
                      req.user.permissions.tills.processRefunds == true ||
                      (req.user.permissions.tills.processRefunds ==
                        "commonWorkingGroup" &&
                        req.user.working_groups.includes(till.group_id))
                    ) {
                      TillActivity.getByTillId(till_id, function(status) {
                        if (status.opening == 1) {
                          Transactions.getTotalCashTakingsSince(
                            till.till_id,
                            status.timestamp,
                            function(revenue_total, total_refunds) {
                              var tillBalance =
                                Number(status.counted_float) +
                                (Number(revenue_total) - Number(total_refunds));
                              Transactions.getByMurakamiOrSumUpId(
                                till_id,
                                transaction_id,
                                function(err, transaction) {
                                  if (!err && transaction) {
                                    if (!transaction.summary.refunded) {
                                      if (
                                        moment(transaction.date).isAfter(
                                          moment().subtract(30, "days")
                                        )
                                      ) {
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
                                            (transaction.summary
                                              .paymentMethod == "cash" ||
                                              transaction.summary
                                                .paymentMethod == "card") &&
                                            transaction.summary.totals.money > 0
                                          ) {
                                            if (transaction.summary.sumupId) {
                                              Helpers.SumUpAuth(function(
                                                err,
                                                access_token
                                              ) {
                                                if (!err && access_token) {
                                                  Helpers.SumUpGetTransaction(
                                                    transaction.summary.sumupId,
                                                    access_token,
                                                    function(
                                                      err,
                                                      sumupTransaction
                                                    ) {
                                                      if (
                                                        !err &&
                                                        sumupTransaction
                                                      ) {
                                                        if (
                                                          sumupTransaction.amount ==
                                                          transaction.summary
                                                            .totals.money
                                                        ) {
                                                          if (
                                                            sumupTransaction.status ==
                                                            "SUCCESSFUL"
                                                          ) {
                                                            if (
                                                              action == "issue"
                                                            ) {
                                                              if (
                                                                amount <=
                                                                  sumupTransaction.amount &&
                                                                amount >= 0.01
                                                              ) {
                                                                // Issue sumup refund.
                                                                Helpers.SumUpIssueRefund(
                                                                  transaction_id,
                                                                  amount,
                                                                  access_token,
                                                                  function(
                                                                    err
                                                                  ) {
                                                                    if (!err) {
                                                                      Transactions.processRefund(
                                                                        amount,
                                                                        transaction,
                                                                        function(
                                                                          err
                                                                        ) {
                                                                          if (
                                                                            !err
                                                                          ) {
                                                                            response.status =
                                                                              "ok";
                                                                            response.msg =
                                                                              "Refund successfully issued by SumUp!";
                                                                            res.send(
                                                                              response
                                                                            );
                                                                          } else {
                                                                            response.msg =
                                                                              "SumUp failed to issue the refund - please contact support.";
                                                                            res.send(
                                                                              response
                                                                            );
                                                                          }
                                                                        }
                                                                      );
                                                                    } else {
                                                                      response.msg =
                                                                        "Something went wrong issuing the refund with SumUp - please contact support.";
                                                                      res.send(
                                                                        response
                                                                      );
                                                                    }
                                                                  }
                                                                );
                                                              } else {
                                                                response.msg =
                                                                  "Please enter a valid refund amount.";
                                                                res.send(
                                                                  response
                                                                );
                                                              }
                                                            } else {
                                                              Members.getAll(
                                                                function(
                                                                  err,
                                                                  members,
                                                                  membersObj
                                                                ) {
                                                                  StockCategories.getCategoriesByTillId(
                                                                    till_id,
                                                                    "tree",
                                                                    function(
                                                                      err,
                                                                      categories
                                                                    ) {
                                                                      var flatCategories = Helpers.flatten(
                                                                        categories
                                                                      );

                                                                      var flatCategoriesAsObj = {};
                                                                      Transactions.formatTransactions(
                                                                        [
                                                                          transaction
                                                                        ],
                                                                        membersObj,
                                                                        flatCategories,
                                                                        till_id,
                                                                        function(
                                                                          formattedTransactions
                                                                        ) {
                                                                          transaction.sumupVerified = true;
                                                                          response.status =
                                                                            "ok";
                                                                          response.transaction =
                                                                            formattedTransactions[0];
                                                                          res.send(
                                                                            response
                                                                          );
                                                                        }
                                                                      );
                                                                    }
                                                                  );
                                                                }
                                                              );
                                                            }
                                                          } else {
                                                            response.msg =
                                                              "Transaction failed at point of purchase.";
                                                            res.send(response);
                                                          }
                                                        } else {
                                                          response.msg =
                                                            "Murakami and SumUp's records are inconsistent - please contact support.";
                                                          res.send(response);
                                                        }
                                                      } else {
                                                        response.msg =
                                                          "Transaction could not be verified by SumUp.";
                                                        res.send(response);
                                                      }
                                                    }
                                                  );
                                                } else {
                                                  response.msg =
                                                    "SumUp could not be contact - please contact support.";
                                                  res.send(response);
                                                }
                                              });
                                            } else {
                                              if (action == "issue") {
                                                if (
                                                  Number(amount) <=
                                                    Number(
                                                      transaction.summary.totals
                                                        .money
                                                    ) &&
                                                  Number(amount) >= 0.01 &&
                                                  Number(amount) <=
                                                    Number(tillBalance)
                                                ) {
                                                  Transactions.processRefund(
                                                    amount,
                                                    transaction,
                                                    function(err) {
                                                      if (!err) {
                                                        response.status = "ok";
                                                        response.msg =
                                                          "Refund successfully recorded - please give the customer £" +
                                                          Number(
                                                            amount
                                                          ).toFixed(2);
                                                        res.send(response);
                                                      } else {
                                                        res.msg =
                                                          "Something went wrong recording the refund. Please contact support.";
                                                        res.send(response);
                                                      }
                                                    }
                                                  );
                                                } else {
                                                  console.log(
                                                    "Refund amount:",
                                                    amount
                                                  );

                                                  console.log(
                                                    "Total transaction:",
                                                    transaction.summary.totals
                                                      .money
                                                  );

                                                  console.log(tillBalance);
                                                  response.msg =
                                                    "Please enter a valid refund amount.";
                                                  res.send(response);
                                                }
                                              } else {
                                                Members.getAll(function(
                                                  err,
                                                  members,
                                                  membersObj
                                                ) {
                                                  StockCategories.getCategoriesByTillId(
                                                    till_id,
                                                    "tree",
                                                    function(err, categories) {
                                                      var flatCategories = Helpers.flatten(
                                                        categories
                                                      );

                                                      var flatCategoriesAsObj = {};
                                                      Transactions.formatTransactions(
                                                        [transaction],
                                                        membersObj,
                                                        flatCategories,
                                                        till_id,
                                                        function(
                                                          formattedTransactions
                                                        ) {
                                                          response.status =
                                                            "ok";
                                                          response.transaction =
                                                            formattedTransactions[0];
                                                          res.send(response);
                                                        }
                                                      );
                                                    }
                                                  );
                                                });
                                              }
                                            }
                                          } else {
                                            response.msg =
                                              "Malformed transaction - please make sure you are using the correct input for";
                                            res.send(response);
                                          }
                                        } else {
                                          response.msg =
                                            "This transaction is non-refundable";
                                          res.send(response);
                                        }
                                      } else {
                                        response.msg =
                                          "Transaction is older than 30 days";
                                        res.send(response);
                                      }
                                    } else {
                                      response.msg =
                                        "Transaction has already been refunded!";
                                      res.send(response);
                                    }
                                  } else {
                                    response.msg =
                                      "Transaction not found. Please check that the transaction ID was entered correctly and try again";
                                    res.send(response);
                                  }
                                }
                              );
                            }
                          );
                        } else {
                          response.msg = "Till closed";
                          res.send(response);
                        }
                      });
                    } else {
                      response.msg =
                        "You don't have permissions to process refunds on this till";
                      res.send(response);
                    }
                  } else {
                    response.msg = "Till not found!";
                    res.send(response);
                  }
                });
              } else {
                response.msg = "Please select a valid refund type";
                res.send(response);
              }
            } else {
              response.msg = "Please enter a valid action";
              res.send(response);
            }
          } else {
            response.msg = "Please select an action";
            res.send(response);
          }
        } else {
          response.msg = "Please select a refund type";
          res.send(response);
        }
      } else {
        response.msg = "Please enter a transaction ID";
        res.send(response);
      }
    } else {
      response.msg = "Please select a valid till";
      res.send(response);
    }
  }
);

module.exports = router;
