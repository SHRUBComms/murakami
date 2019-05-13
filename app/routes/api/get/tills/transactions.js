// /api/get/tills/transactions

var router = require("express").Router();
var async = require("async");
var moment = require("moment");
moment.locale("en-gb");

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");
var Tills = Models.Tills;
var StockCategories = Models.StockCategories;
var TillActivity = Models.TillActivity;
var Transactions = Models.Transactions;
var Members = Models.Members;

var Auth = require(rootDir + "/app/configs/auth");
var Helpers = require(rootDir + "/app/configs/helpful_functions");

router.get("/:till_id", Auth.isLoggedIn, function(req, res) {
  Tills.getById(req.params.till_id, function(err, till) {
    if (till) {
      TillActivity.getByTillId(req.params.till_id, function(status) {
        if (status.opening == 1 || req.query.startDate) {
          Transactions.getAllBetweenTwoDatesByTillId(
            req.params.till_id,
            req.query.startDate || status.timestamp,
            req.query.endDate || new Date(),
            function(err, transactions) {
              if (transactions.length > 0) {
                Members.getAll(function(err, members, membersObj) {
                  StockCategories.getCategoriesByTillId(
                    req.params.till_id,
                    "tree",
                    function(err, categories) {
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

                              formattedTransaction.date = moment(
                                transaction.date
                              );
                              formattedTransaction.date = moment(
                                formattedTransaction.date
                              ).format("D/M/YY hh:mm A");

                              formattedTransaction.customer = {};
                              if (transaction.member_id != "anon") {
                                formattedTransaction.customer.id =
                                  transaction.member_id;
                                if (membersObj[transaction.member_id]) {
                                  formattedTransaction.customer.name =
                                    membersObj[transaction.member_id]
                                      .first_name +
                                    " " +
                                    membersObj[transaction.member_id]
                                      .last_name +
                                    "<br />(<a href='" +
                                    process.env.PUBLIC_ADDRESS +
                                    "/members/view/" +
                                    transaction.member_id +
                                    "?till_id=" +
                                    req.params.till_id +
                                    "' target='_blank''>" +
                                    formattedTransaction.customer.id +
                                    "</a>)";
                                } else {
                                  formattedTransaction.customer.name =
                                    "Member (<a href='/members/view/" +
                                    formattedTransaction.customer.id +
                                    "?till_id=" +
                                    req.params.till_id +
                                    "' target='_blank'>view profile</a>)";
                                }
                              } else {
                                formattedTransaction.customer.name =
                                  "Non-member";
                              }

                              formattedTransaction.totals = {};
                              formattedTransaction.totals.tokens =
                                transaction.summary.totals.tokens || "0";
                              formattedTransaction.totals.money =
                                "£" +
                                (transaction.summary.totals.money || "0.00");
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
                                  transaction.summary.bill[i].item_id ==
                                  "donation"
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
                                  transaction.summary.bill[i].item_id ==
                                  "membership"
                                ) {
                                  bill +=
                                    "Tokens added for becoming a member: " +
                                    transaction.summary.bill[i].tokens;
                                } else if (
                                  flatCategoriesAsObj[
                                    transaction.summary.bill[i].item_id
                                  ]
                                ) {
                                  let value =
                                    transaction.summary.bill[i].tokens ||
                                    transaction.summary.bill[i].value;
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
                                    ].absolute_name;

                                  if (transaction.summary.bill[i].condition) {
                                    bill +=
                                      " (" +
                                      transaction.summary.bill[i].condition +
                                      ")";
                                  }

                                  bill += ": " + parseFloat(value).toFixed(2);
                                  if (discount) {
                                    bill +=
                                      " <span class='small'>(" +
                                      discount +
                                      "% off from " +
                                      parseFloat(
                                        transaction.summary.bill[i].tokens ||
                                          transaction.summary.bill[i].value
                                      ).toFixed(2) +
                                      ")</span>";
                                  }
                                }

                                if (i + 1 !== transaction.summary.bill.length) {
                                  bill += "<br />";
                                }
                              }

                              if (transaction.summary.comment) {
                                bill +=
                                  "<br />Comment: " +
                                  transaction.summary.comment;
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
                    }
                  );
                });
              } else {
                res.send([]);
              }
            }
          );
        } else {
          res.send([]);
        }
      });
    } else {
      res.send([]);
    }
  });
});

module.exports = router;
