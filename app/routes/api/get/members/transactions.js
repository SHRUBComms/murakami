// /api/get/members/transactions

var router = require("express").Router();
var async = require("async");
var moment = require("moment");
moment.locale("en-gb");

var rootDir = process.env.CWD;

var Tills = require(rootDir + "/app/models/tills");
var Members = require(rootDir + "/app/models/members");
var Carbon = require(rootDir + "/app/models/carbon-calculations");

var Auth = require(rootDir + "/app/configs/auth");
var Helpers = require(rootDir + "/app/configs/helpful_functions");

router.get(
  "/:member_id",
  Auth.isLoggedIn,
  Auth.canAccessPage("members", "transactionHistory"),
  function(req, res) {
    Members.getById(req.params.member_id, req.user, function(err, member) {
      if (!err && member.transactionHistory) {
        Tills.getTransactionsByMemberId(req.params.member_id, function(
          err,
          transactions
        ) {
          if (transactions.length > 0) {
            Tills.getCategories("tree", function(err, categories) {
              Carbon.getCategories(function(err, carbonCategories) {
                var flatCategories = Helpers.flatten(categories);

                var flatCategoriesAsObj = {};
                async.each(
                  flatCategories,
                  function(category, callback) {
                    flatCategoriesAsObj[category.item_id] = category;

                    callback();
                  },
                  function() {
                    formattedTransactions = [];
                    async.each(
                      transactions,
                      function(transaction, callback) {
                        let formattedTransaction = {};

                        transaction.summary = JSON.parse(transaction.summary);

                        formattedTransaction.date = moment(transaction.date);
                        formattedTransaction.date = moment(
                          formattedTransaction.date
                        ).format("D/M/YY hh:mm A");

                        formattedTransaction.till_name = transaction.till_name;

                        formattedTransaction.customer = {};
                        if (transaction.member_id != "anon") {
                          formattedTransaction.customer.id =
                            transaction.member_id;
                          formattedTransaction.customer.name =
                            "Member (<a href='/members/view/" +
                            formattedTransaction.customer.id +
                            "' target='_blank'>view profile</a>)";
                        } else {
                          formattedTransaction.customer.name = "Non-member";
                        }

                        formattedTransaction.totals = {};
                        formattedTransaction.totals.tokens =
                          transaction.summary.totals.tokens || "0";
                        formattedTransaction.totals.money =
                          "£" + (transaction.summary.totals.money || "0.00");
                        formattedTransaction.paymentMethod =
                          transaction.summary.paymentMethod || "";
                        if (formattedTransaction.paymentMethod) {
                          formattedTransaction.totals.money +=
                            " (" +
                            formattedTransaction.paymentMethod.toProperCase() +
                            ")";
                        }

                        formattedTransaction.bill = [];
                        let bill = "";
                        for (
                          let i = 0;
                          i < transaction.summary.bill.length;
                          i++
                        ) {
                          if (
                            transaction.summary.bill[i].item_id == "donation"
                          ) {
                            bill +=
                              "Tokens added for donation: " +
                              transaction.summary.bill[i].tokens;
                          } else if (
                            transaction.summary.bill[i].item_id ==
                            "volunteering"
                          ) {
                            bill +=
                              "Tokens added for volunteering: " +
                              transaction.summary.bill[i].tokens;
                          } else if (
                            flatCategoriesAsObj[
                              transaction.summary.bill[i].item_id
                            ]
                          ) {
                            let value = transaction.summary.bill[i].tokens;
                            let discount;
                            if (transaction.summary.discount_info) {
                              if (
                                transaction.summary.discount_info[
                                  transaction.summary.bill[i].item_id
                                ]
                              ) {
                                discount =
                                  transaction.summary.discount_info[
                                    transaction.summary.bill[i].item_id
                                  ];
                                value = value - value * (discount / 100);
                              }
                            }

                            bill +=
                              flatCategoriesAsObj[
                                transaction.summary.bill[i].item_id
                              ].absolute_name +
                              ": " +
                              parseFloat(value).toFixed(2);
                            if (discount) {
                              bill +=
                                " <span class='small'>(" +
                                discount +
                                "% off from " +
                                parseFloat(
                                  transaction.summary.bill[i].tokens
                                ).toFixed(2) +
                                ")</span>";
                            }
                          } else if (
                            carbonCategories[
                              transaction.summary.bill[i].item_id
                            ]
                          ) {
                            bill +=
                              carbonCategories[
                                transaction.summary.bill[i].item_id
                              ].name +
                              ": " +
                              parseFloat(
                                transaction.summary.bill[i].tokens
                              ).toFixed(2);
                          } else {
                            bill +=
                              "Unknown Item: " +
                              parseFloat(
                                transaction.summary.bill[i].tokens
                              ).toFixed(2);
                          }

                          if (i + 1 !== transaction.summary.bill.length) {
                            bill += "<br />";
                          }
                        }

                        if (transaction.summary.comment) {
                          bill +=
                            "<br />Comment: " + transaction.summary.comment;
                        }

                        formattedTransaction.bill = bill;

                        formattedTransactions.push(formattedTransaction);

                        callback();
                      },
                      function() {
                        res.send(formattedTransactions);
                      }
                    );
                  }
                );
              });
            });
          } else {
            res.send([]);
          }
        });
      } else {
        res.send([]);
      }
    });
  }
);

module.exports = router;
