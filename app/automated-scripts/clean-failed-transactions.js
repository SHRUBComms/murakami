var CronJob = require("cron").CronJob;
var async = require("async");
var request = require("request");
var moment = require("moment");
moment.locale("en-gb");

// Import models etc.
var rootDir = process.env.CWD;
var Models = require(rootDir + "/app/models/sequelize");
var Transactions = Models.Transactions;

var failedTransactions = new CronJob({
  // 2am everyday.
  cronTime: "0 0 2 * * *",
  onTick: function() {
    console.log("Started cleaning transactions.");
    var fxTransactions = {}; // Sumup transactions by id.
    var i = 0;
    Transactions.getAllBetweenTwoDates(
      moment()
        .subtract(1, "days")
        .startOf("day"),
      moment()
        .subtract(1, "days")
        .endOf("day"),
      function(err, transactions) {
        async.eachSeries(
          transactions,
          function(transaction, callback) {
            if (
              !transaction.summary.sumupId &&
              transaction.summary.paymentMethod == "card"
            ) {
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
                function(error, response, body) {
                  if (!error && response.statusCode == 200) {
                    request.get(
                      "https://api.sumup.com/v0.1/me/transactions/history?limit=9999&" +
                        "newest_time=" +
                        moment(transaction.date)
                          .add(1, "hours")
                          .add(10, "minutes")
                          .toISOString() +
                        "&oldest_time=" +
                        moment(transaction.date)
                          .add(1, "hours")
                          .subtract(10, "minutes")
                          .toISOString(),
                      {
                        headers: {
                          authorization: "Bearer " + body.access_token
                        }
                      },
                      function(error, response, body) {
                        body = JSON.parse(body);
                        if (!body.error_code) {
                          async.eachSeries(
                            body.items,
                            function(fxTransaction, callback) {
                              if (fxTransaction.status == "SUCCESSFUL") {
                                if (
                                  fxTransaction.amount ==
                                  transaction.summary.totals.money
                                ) {
                                  if (
                                    !fxTransactions[
                                      fxTransaction.transaction_code
                                    ]
                                  ) {
                                    Transactions.findOne({
                                      where: {
                                        summary: {
                                          sumupId:
                                            fxTransaction.transaction_code
                                        }
                                      }
                                    }).nodeify(function(err, fxInUse) {
                                      if (!fxInUse) {
                                        var updatedSummary =
                                          transaction.summary;
                                        updatedSummary.sumupId =
                                          fxTransaction.transaction_code;
                                        Transactions.update(
                                          { summary: updatedSummary },
                                          {
                                            where: {
                                              transaction_id:
                                                transaction.transaction_id
                                            }
                                          }
                                        ).nodeify(function() {
                                          fxTransactions[
                                            fxTransaction.transaction_code
                                          ] = true;
                                          setTimeout(function() {
                                            callback();
                                          }, 500);
                                        });
                                      } else {
                                        callback();
                                      }
                                    });
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
                              callback();
                            }
                          );
                        } else {
                          callback();
                        }
                      }
                    );
                  } else {
                    callback();
                  }
                }
              );
              i = i + 1;
              console.log(i);
            } else {
              callback();
            }
          },
          function() {
            console.log(
              "Complete - " +
                Object.keys(fxTransactions).length +
                " transactions fixed"
            );
          }
        );
      }
    );
  },
  start: false,
  timeZone: "Europe/London"
});

module.exports = failedTransactions;
