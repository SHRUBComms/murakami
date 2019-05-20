// /till/transaction

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
var WorkingGroups = Models.WorkingGroups;

var Auth = require(rootDir + "/app/configs/auth");
var Helpers = require(rootDir + "/app/helper-functions/root");

router.get(
  "/:till_id",
  Auth.isLoggedIn,
  Auth.canAccessPage("tills", "processTransaction"),
  function(req, res) {
    Tills.getById(req.params.till_id, function(err, till) {
      if (till) {
        if (
          req.user.permissions.tills.processTransaction == true ||
          (req.user.permissions.tills.processTransaction ==
            "commonWorkingGroup" &&
            req.user.working_groups.includes(till.group_id))
        ) {
          TillActivity.getByTillId(req.params.till_id, function(status) {
            if (status.opening == "1") {
              WorkingGroups.getAll(function(err, allWorkingGroups) {
                var group = allWorkingGroups[till.group_id];
                StockCategories.getCategoriesByTillId(
                  req.params.till_id,
                  "tree",
                  function(err, categories) {
                    var presetTransaction;
                    if (req.query.transaction) {
                      try {
                        presetTransaction = JSON.parse(
                          decodeURIComponent(req.query.transaction)
                        );
                      } catch (err) {
                        presetTransaction = null;
                      }
                    }

                    res.render("till/root", {
                      tillMode: true,
                      title: "Transaction",
                      transactionsActive: true,
                      till: till,
                      allWorkingGroups: allWorkingGroups,
                      working_group: group,
                      categories: categories,
                      diode_api_key: process.env.DIODE_API_KEY,
                      sumup_affiliate_key: process.env.SUMUP_AFFILIATE_KEY,
                      sumup_app_id: process.env.SUMUP_APP_ID,
                      murakamiMsg: req.query.murakamiMsg || null,
                      murakamiStatus: req.query.murakamiStatus || null,
                      smpStatus: req.query["smp-status"] || null,
                      smpMsg: req.query["smp-failure-cause"] || null,
                      member_id: req.query.member_id || null,
                      presetTransaction: presetTransaction
                    });
                  }
                );
              });
            } else {
              res.redirect(
                process.env.PUBLIC_ADDRESS + "/till/open/" + req.params.till_id
              );
            }
          });
        } else {
          req.flash(
            "error",
            "You don't have permission to process transactions on this till!"
          );
          res.redirect(process.env.PUBLIC_ADDRESS + "/till/select");
        }
      } else {
        res.redirect(process.env.PUBLIC_ADDRESS + "/till/select");
      }
    });
  }
);

router.post(
  "/",
  Auth.isLoggedIn,
  Auth.canAccessPage("tills", "processTransaction"),
  function(req, res) {
    var till_id = req.body.till_id;
    var member_id = req.body.member_id;
    var paymentMethod = req.body.paymentMethod;
    var transaction = req.body.transaction;
    var payWithTokens = JSON.parse(req.body.payWithTokens) || false;
    var note = req.body.note;

    var membershipBought;
    var validTransaction = true;
    var whyTransactionFailed;

    Tills.getById(till_id, function(err, till) {
      if (till && !err) {
        if (
          req.user.permissions.tills.processTransaction == true ||
          (req.user.permissions.tills.processTransaction ==
            "commonWorkingGroup" &&
            req.user.working_groups.includes(till.group_id))
        ) {
          TillActivity.getByTillId(till_id, function(status) {
            if (status.opening == 1) {
              CarbonCategories.getAll(function(err, carbonCategories) {
                StockCategories.getFlatCategoriesByTillId(till_id, function(
                  err,
                  categories
                ) {
                  var categoriesAsObj = {};
                  var transactionSanitized = [];
                  var carbonTransaction = {};

                  var tokens_total = 0;
                  var money_total = 0;
                  var weight_total = 0;
                  var member_discount_tokens = 0;
                  var member_discount_money = 0;
                  var discount_info = {};

                  async.each(
                    categories,
                    function(category, callback) {
                      categoriesAsObj[category.item_id] = category;
                      callback();
                    },
                    function() {
                      async.eachOf(
                        transaction,
                        function(foo, i, callback) {
                          if (categoriesAsObj[transaction[i].id]) {
                            let id = transaction[i].id;
                            if (categoriesAsObj[id].active == 1) {
                              let weight = transaction[i].weight;
                              let value = 0;
                              let condition = transaction[i].condition;
                              if (categoriesAsObj[id].value) {
                                value = categoriesAsObj[id].value;
                              } else {
                                value = transaction[i].value;
                              }

                              transaction[i] = categoriesAsObj[id];
                              transaction[i].weight = weight;
                              transaction[i].value = value;
                              transaction[i].condition = condition;

                              if (categoriesAsObj[id].action) {
                                if (
                                  categoriesAsObj[id].action.substring(0, 3) ==
                                  "MEM"
                                ) {
                                  membershipBought = categoriesAsObj[id].action;
                                }
                              }

                              if (categoriesAsObj[id].member_discount) {
                                discount_info[id] =
                                  categoriesAsObj[id].member_discount;
                              }

                              if (transaction[i].allowTokens == 1) {
                                tokens_total =
                                  +tokens_total + +transaction[i].value;
                                if (categoriesAsObj[id].member_discount) {
                                  member_discount_tokens +=
                                    (categoriesAsObj[id].member_discount /
                                      100) *
                                    transaction[i].value;
                                }
                              } else {
                                money_total =
                                  +money_total + +transaction[i].value;
                                if (categoriesAsObj[id].member_discount) {
                                  member_discount_money +=
                                    (categoriesAsObj[id].member_discount /
                                      100) *
                                    transaction[i].value;
                                }
                              }

                              if (
                                categoriesAsObj[id].needsCondition == 1 &&
                                [
                                  "Bought New",
                                  "Reused",
                                  "Fixed in workshop"
                                ].includes(transaction[i].condition)
                              ) {
                                condition = transaction[i].condition;
                              } else {
                                condition = null;
                              }

                              if (
                                transaction[i].weight > 0 &&
                                carbonCategories[transaction[i].carbon_id]
                              ) {
                                if (
                                  carbonTransaction[transaction[i].carbon_id]
                                ) {
                                  carbonTransaction[transaction[i].carbon_id] =
                                    +carbonTransaction[
                                      transaction[i].carbon_id
                                    ] + +transaction[i].weight;
                                } else {
                                  carbonTransaction[transaction[i].carbon_id] =
                                    transaction[i].weight;
                                }
                                weight_total =
                                  +weight_total + +transaction[i].weight;
                              }

                              transaction[i] = {};
                              transaction[i].value = value;
                              transaction[i].item_id = id;
                              transaction[i].condition = condition;
                              transactionSanitized.push(transaction[i]);
                            }
                            callback();
                          } else {
                            callback();
                          }
                        },
                        function() {
                          transaction = transactionSanitized;

                          var formattedTransaction = {
                            till_id: till_id,
                            user_id: req.user.id,
                            member_id: member_id || "anon",
                            date: new Date(),
                            summary: {
                              totals: {},
                              bill: transaction,
                              comment: note
                            }
                          };

                          Members.getById(
                            member_id,
                            {
                              permissions: {
                                members: {
                                  name: true,
                                  balance: true,
                                  membershipDates: true
                                }
                              }
                            },
                            function(err, member) {
                              var foundMember = false;
                              var anonTransaction = false;

                              if (member && !err && member_id) {
                                foundMember = true;
                              } else if (
                                formattedTransaction.member_id == "anon"
                              ) {
                                anonTransaction = true;
                              }

                              if (foundMember || anonTransaction) {
                                let totals = {};

                                if (
                                  foundMember &&
                                  (member.is_member == 1 || membershipBought)
                                ) {
                                  money_total =
                                    money_total - member_discount_money;
                                  tokens_total =
                                    tokens_total - member_discount_tokens;

                                  formattedTransaction.summary.discount_info = discount_info;

                                  if (payWithTokens == true) {
                                    if (money_total == 0) {
                                      if (member.balance >= tokens_total) {
                                        totals.tokens = Math.ceil(tokens_total);
                                      } else {
                                        let difference =
                                          tokens_total - member.balance;
                                        totals.money = difference.toFixed(2);
                                        totals.tokens =
                                          tokens_total - difference;
                                      }
                                    } else {
                                      var money = 0;
                                      var tokens = 0;

                                      if (member.balance - tokens_total >= 0) {
                                        tokens = tokens_total;
                                        money = money_total;
                                      } else {
                                        tokens = member.balance;
                                        money =
                                          +money_total +
                                          Math.abs(
                                            member.balance - tokens_total
                                          );
                                      }

                                      totals.money = money.toFixed(2);
                                      totals.tokens = Math.ceil(tokens);
                                    }
                                  } else {
                                    totals.money = (
                                      +tokens_total + +money_total
                                    ).toFixed(2);
                                  }

                                  if (totals.money == 0 && totals.tokens == 0) {
                                    transaction.summary.paymentMethod = null;
                                  }
                                } else {
                                  totals.money = (
                                    tokens_total + money_total
                                  ).toFixed(2);
                                  formattedTransaction.summary.totals = totals;

                                  if (totals.money == 0) {
                                    paymentMethod = null;
                                  }
                                }

                                formattedTransaction.summary.totals = totals;

                                if (
                                  formattedTransaction.summary.totals.money <=
                                    1 &&
                                  paymentMethod == "card"
                                ) {
                                  validTransaction = false;
                                  whyTransactionFailed =
                                    "To pay by card, please spend at least £1.00";
                                }

                                if (
                                  membershipBought &&
                                  formattedTransaction.member_id == "anon"
                                ) {
                                  validTransaction = false;
                                  whyTransactionFailed =
                                    "A membership was bought, but no member was selected. To add a member, please go to the add member page.";
                                }

                                if (
                                  formattedTransaction.summary.bill.length == 0
                                ) {
                                  validTransaction = false;
                                  whyTransactionFailed =
                                    "There must be at least one item in the transaction";
                                }

                                if (validTransaction) {
                                  Transactions.addTransaction(
                                    formattedTransaction,
                                    function(err, transaction_id) {
                                      if (err) {
                                        res.send({
                                          status: "fail",
                                          msg:
                                            "Something has gone terribly wrong!"
                                        });
                                      } else {
                                        let response = {
                                          status: "ok",
                                          msg: "Transaction complete!"
                                        };

                                        if (
                                          formattedTransaction.summary.totals
                                            .money > 0
                                        ) {
                                          formattedTransaction.summary.paymentMethod = paymentMethod;
                                          response.msg +=
                                            " £" +
                                            formattedTransaction.summary.totals
                                              .money;
                                          if (
                                            formattedTransaction.summary.totals
                                              .tokens > 0
                                          ) {
                                            response.msg += " and";
                                          }
                                        }

                                        if (
                                          formattedTransaction.summary.totals
                                            .tokens > 0
                                        ) {
                                          response.msg +=
                                            " " +
                                            formattedTransaction.summary.totals
                                              .tokens +
                                            " tokens";
                                        }

                                        if (
                                          !formattedTransaction.summary.totals
                                            .tokens &&
                                          !formattedTransaction.summary.totals
                                            .money
                                        ) {
                                          response.msg += " Nothing";
                                        }

                                        response.msg += " paid.";

                                        if (foundMember) {
                                          if (
                                            formattedTransaction.summary.totals
                                              .tokens > 0
                                          ) {
                                            member.balance =
                                              member.balance -
                                              formattedTransaction.summary
                                                .totals.tokens;
                                          } else {
                                            member.balance = member.balance;
                                          }

                                          if (membershipBought) {
                                            if (
                                              member.membership_type == "unpaid"
                                            ) {
                                              Members.update(
                                                { membership_type: null },
                                                {
                                                  where: {
                                                    member_id: member_id
                                                  }
                                                }
                                              ).nodeify(function() {});
                                            }
                                          }

                                          if (membershipBought == "MEM-FY") {
                                            Members.renew(
                                              member_id,
                                              "full_year",
                                              function() {}
                                            );

                                            response.msg +=
                                              " 12 months of membership issued.";
                                          } else if (
                                            membershipBought == "MEM-HY"
                                          ) {
                                            Members.renew(
                                              member_id,
                                              "half_year",
                                              function() {}
                                            );

                                            response.msg +=
                                              " 6 months of membership issued.";
                                          } else if (
                                            membershipBought == "MEM-QY"
                                          ) {
                                            Members.renew(
                                              member_id,
                                              "3_months",
                                              function() {}
                                            );

                                            response.msg +=
                                              " 3 months of membership issued.";
                                          }
                                        }

                                        formattedTransaction.summary.totals.money =
                                          formattedTransaction.summary.totals
                                            .money || 0;

                                        if (foundMember) {
                                          Members.updateBalance(
                                            member_id,
                                            member.balance,
                                            function(err) {}
                                          );
                                        }

                                        var carbon = {
                                          member_id: member_id,
                                          user_id: req.user.id,
                                          trans_object: carbonTransaction,
                                          amount: weight_total,
                                          group_id: till.group_id,
                                          method: "reused"
                                        };
                                        Carbon.add(carbon, function(err) {
                                          Helpers.calculateCarbon(
                                            [carbon],
                                            carbonCategories,
                                            function(carbonSaved) {
                                              response.msg +=
                                                " " +
                                                Math.abs(
                                                  (carbonSaved * 1e-3).toFixed(
                                                    2
                                                  )
                                                ) +
                                                "kg of carbon saved.";

                                              if (paymentMethod == "card") {
                                                var sumupSummon =
                                                  "sumupmerchant://pay/1.0?affiliate-key=" +
                                                  process.env
                                                    .SUMUP_AFFILIATE_KEY +
                                                  "&app-id=" +
                                                  process.env.SUMUP_APP_ID +
                                                  "&title=" +
                                                  req.user.allWorkingGroupsObj[
                                                    till.group_id
                                                  ].name +
                                                  " purchase" +
                                                  "&total=" +
                                                  totals.money +
                                                  "&amount=" +
                                                  totals.money +
                                                  "&currency=GBP" +
                                                  "&foreign-tx-id=" +
                                                  transaction_id +
                                                  "&callback=" +
                                                  encodeURIComponent(
                                                    process.env.PUBLIC_ADDRESS +
                                                      "/api/get/tills/smp-callback" +
                                                      "/?murakamiStatus=" +
                                                      response.status +
                                                      "&murakamiMsg=" +
                                                      response.msg +
                                                      "&till_id=" +
                                                      till.till_id
                                                  );

                                                if (member) {
                                                  if (member.email) {
                                                    sumupSummon +=
                                                      "&receipt-email=" +
                                                      member.email;
                                                  }
                                                  if (member.phone_no) {
                                                    sumupSummon +=
                                                      "&receipt-mobilephone=" +
                                                      member.phone_no;
                                                  }
                                                }

                                                if (response.status == "ok") {
                                                  res.send({
                                                    status: "redirect",
                                                    url: sumupSummon
                                                  });
                                                } else {
                                                  res.send(response);
                                                }
                                              } else {
                                                res.send(response);
                                              }
                                            }
                                          );
                                        });
                                      }
                                    }
                                  );
                                } else {
                                  res.send({
                                    status: "fail",
                                    msg: whyTransactionFailed
                                  });
                                }
                              } else {
                                res.send({
                                  status: "fail",
                                  msg: "Couldn't find that member!"
                                });
                              }
                            }
                          );
                        }
                      );
                    }
                  );
                });
              });
            } else {
              res.send({ status: "fail", msg: "Till is not open." });
            }
          });
        } else {
          res.send({
            status: "fail",
            msg:
              "You don't have permission to process transactions on this till."
          });
        }
      } else {
        res.send({ status: "fail", msg: "Till does not exist." });
      }
    });
  }
);

module.exports = router;
