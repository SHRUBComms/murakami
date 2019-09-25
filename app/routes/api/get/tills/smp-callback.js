// /api/get/tills/smp-callback

var router = require("express").Router();
var async = require("async");
var request = require("request");

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");
var Tills = Models.Tills;
var Carbon = Models.Carbon;
var Transactions = Models.Transactions;

var Auth = require(rootDir + "/app/configs/auth");

router.get(
  "/",
  Auth.isLoggedIn,
  Auth.canAccessPage("tills", "processTransaction"),
  function(req, res) {
    var redirectUri =
      process.env.PUBLIC_ADDRESS +
      "/till/transaction/" +
      req.query.till_id +
      "/?" +
      "sumupCallback=true" +
      "&murakamiStatus=" +
      req.query.murakamiStatus +
      "&transactionSummary=" +
      req.query.transactionSummary +
      "&carbonSummary=" +
      req.query.carbonSummary +
      "&smp-status=" +
      req.query["smp-status"] +
      "&smp-failure-cause=" +
      req.query["smp-failure-cause"];

    var verificationErrorUri =
      process.env.PUBLIC_ADDRESS +
      "/till/transaction/" +
      req.query.till_id +
      "/?" +
      "sumupCallback=true" +
      "&murakamiStatus=" +
      req.query.murakamiStatus +
      "&transactionSummary=" +
      req.query.transactionSummary +
      "&carbonSummary=" +
      req.query.carbonSummary +
      "&smp-status=failed" +
      "&smp-failure-cause=Could not verify card payment.";

    request.post(
      "https://api.sumup.com/token",
      {
        json: {
          grant_type: "password",
          client_id: process.env.SUMUP_CLIENT_ID,
          client_secret: process.env.SUMUP_CLIENT_SECRET,
          username: process.env.SUMUP_USERNAME,
          password: process.env.SUMUP_PASSWORD
        }
      },
      (error, response, body) => {
        if (!error && response.statusCode == 200) {
          request.get(
            "https://api.sumup.com/v0.1/me/transactions?transaction_code=" +
              req.query["smp-tx-code"],
            {
              headers: {
                authorization: "Bearer " + body.access_token
              }
            },
            (error, response, body) => {
              if (!body.error_code) {
                body = JSON.parse(body);

                Transactions.getById(req.query["foreign-tx-id"], function(
                  err,
                  murakamiTransaction
                ) {
                  if (!err && murakamiTransaction) {
                    if (murakamiTransaction.summary.paymentMethod == "card") {
                      if (
                        body.amount == murakamiTransaction.summary.totals.money
                      ) {
                        if (body.status == "SUCCESSFUL") {
                          var updatedSummary = murakamiTransaction.summary;
                          updatedSummary.sumupId = body.transaction_code;
                          Transactions.update(
                            { summary: updatedSummary },
                            {
                              where: {
                                transaction_id:
                                  murakamiTransaction.transaction_id
                              }
                            }
                          ).nodeify(function(err) {
                            res.redirect(redirectUri);
                          });
                        } else {
                          Transactions.removeTransaction(
                            murakamiTransaction.transaction_id,
                            function(err) {
                              Carbon.removeTransaction(
                                murakamiTransaction.transaction_id,
                                function(err) {
                                  res.redirect(redirectUri);
                                }
                              );
                            }
                          );
                        }
                      } else {
                        res.redirect(verificationErrorUri);
                      }
                    } else {
                      res.redirect(verificationErrorUri);
                    }
                  } else {
                    res.redirect(verificationErrorUri);
                  }
                });
              } else {
                res.redirect(verificationErrorUri);
              }
            }
          );
        } else {
          res.redirect(verificationErrorUri);
        }
      }
    );
  }
);

module.exports = router;
