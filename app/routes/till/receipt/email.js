// /till/report

var router = require("express").Router();
var async = require("async");
var moment = require("moment");
moment.locale("en-gb");

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");
var Tills = Models.Tills;
var TillActivity = Models.TillActivity;
var Transactions = Models.Transactions;
var StockCategories = Models.StockCategories;
var Members = Models.Members;
var Carbon = Models.Carbon;
var CarbonCategories = Models.CarbonCategories;

var Helpers = require(rootDir + "/app/helper-functions/root");
var Mail = require(rootDir + "/app/configs/mail/root");
var Auth = require(rootDir + "/app/configs/auth");

router.post(
  "/",
  Auth.isLoggedIn,
  Auth.canAccessPage("tills", "processTransaction"),
  function(req, res) {
    var response = { status: "fail" };

    var member_id = req.body.member_id;
    var email = req.body.email;
    var transaction_id = req.body.transaction_id;

    var carbon = {};

    if (transaction_id) {
      Transactions.getById(transaction_id, function(err, transaction) {
        if (!err && transaction) {
          if (
            moment(transaction.date).isBetween(
              moment().startOf("day"),
              moment().endOf("day")
            )
          ) {
            Members.getById(
              member_id,
              {
                permissions: {
                  members: {
                    name: true,
                    contactDetails: true
                  }
                }
              },
              function(err, member) {
                if (
                  (!err && member_id && member) ||
                  (!err && !member_id && !member && email)
                ) {
                  email = email || member.email;
                  Tills.getById(transaction.till_id, function(err, till) {
                    if (!err && till) {
                      if (till.disabled == 0) {
                        TillActivity.getByTillId(transaction.till_id, function(
                          status
                        ) {
                          if (status.opening == "1") {
                            Carbon.getByFxId(
                              transaction.transaction_id,
                              function(err, simpleCarbon) {
                                CarbonCategories.getAll(function(
                                  err,
                                  carbonCategories
                                ) {
                                  Helpers.calculateCarbon(
                                    simpleCarbon,
                                    carbonCategories,
                                    function(carbonSaved) {
                                      carbon.savedThisTransaction = Math.abs(
                                        (carbonSaved * 1e-3).toFixed(2)
                                      );
                                      Members.getAll(function(
                                        err,
                                        members,
                                        membersObj
                                      ) {
                                        StockCategories.getCategoriesByTillId(
                                          transaction.till_id,
                                          "tree",
                                          function(err, categories) {
                                            var flatCategories = Helpers.flatten(
                                              categories
                                            );
                                            Transactions.formatTransactions(
                                              [transaction],
                                              membersObj,
                                              flatCategories,
                                              transaction.till_id,
                                              function(formattedTransactions) {
                                                var formattedTransaction =
                                                  formattedTransactions[0];

                                                formattedTransaction.till_name =
                                                  till.name;

                                                if (
                                                  carbon.savedThisTransaction >
                                                  0
                                                ) {
                                                  formattedTransaction.carbon = carbon;
                                                }

                                                var recipient = {
                                                  email: email
                                                };

                                                if (member && member_id) {
                                                  recipient.member_id = member_id;
                                                }

                                                Mail.sendReceipt(
                                                  recipient,
                                                  formattedTransaction,
                                                  function(err) {
                                                    if (!err) {
                                                      response.status = "ok";
                                                      response.msg =
                                                        "Receipt sent!";
                                                      res.send(response);
                                                    } else {
                                                      response.msg =
                                                        "Email could not be sent - please check the email address is correct";
                                                      res.send(response);
                                                    }
                                                  }
                                                );
                                              }
                                            );
                                          }
                                        );
                                      });
                                    }
                                  );
                                });
                              }
                            );
                          } else {
                            response.msg = "Till closed.";
                            res.send(response);
                          }
                        });
                      } else {
                        response.msg = "Till is disabled.";
                        res.send(response);
                      }
                    } else {
                      response.msg = "Can't find till.";
                      res.send(response);
                    }
                  });
                } else {
                  response.msg = "Something went wrong!";
                  res.send(response);
                }
              }
            );
          } else {
            response.msg = "Transaction too old!";
            res.send(response);
          }
        } else {
          response.msg = "Transaction not found!";
          res.send(response);
        }
      });
    } else {
      response.msg = "Transaction ID not specified.";
      res.send(response);
    }
  }
);

module.exports = router;
