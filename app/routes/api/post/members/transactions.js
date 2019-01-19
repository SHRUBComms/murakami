// /api/post/members/transactions

var router = require("express").Router();

var rootDir = process.env.CWD;

var Members = require(rootDir + "/app/models/members");

var Transactions = require(rootDir + "/app/models/transactions");
var Carbon = require(rootDir + "/app/models/carbon-calculations");

var Auth = require(rootDir + "/app/configs/auth");

router.post("/:member_id/:type", Auth.isLoggedIn, function(req, res) {
  var message = {
    status: "fail",
    msg: null
  };

  var useTokens = req.body.useTokens;

  if (useTokens == "true") {
    useTokens = true;
  } else if (useTokens == "false") {
    useTokens = false;
  }

  Members.getById(req.params.member_id, req.user, function(err, member) {
    if (!err && member) {
      if (req.params.type == "add" || req.params.type == "ded") {
        if (useTokens) {
          //

          var transaction = req.body.transaction;

          var formattedTransaction = {};
          formattedTransaction.member_id = req.params.member_id;
          formattedTransaction.transaction_type = req.params.type;
          formattedTransaction.categories = {};
          formattedTransaction.amount = 0;
          formattedTransaction.comment = null;

          var formattedWeights = {};
          formattedWeights.member_id = req.params.member_id;
          formattedWeights.trans_object = {};
          formattedWeights.amount = 0;

          for (let i = 0; i < transaction.length; i++) {
            if (
              !isNaN(parseFloat(transaction[i].tokens)) &&
              transaction[i].tokens > 0
            ) {
              if (formattedTransaction.categories[transaction[i].id] == null) {
                formattedTransaction.categories[transaction[i].id] =
                  transaction[i].tokens;
              } else {
                formattedTransaction.categories[transaction[i].id] =
                  +transaction[i].tokens +
                  +formattedTransaction.categories[transaction[i].id];
              }
            }

            if (
              !isNaN(parseFloat(transaction[i].weight)) &&
              transaction[i].weight > 0
            ) {
              if (formattedWeights.trans_object[transaction[i].id] == null) {
                formattedWeights.trans_object[transaction[i].id] =
                  transaction[i].weight;
              } else {
                formattedWeights.trans_object[transaction[i].id] =
                  +transaction[i].weight +
                  +formattedWeights.trans_object[transaction[i].id];
              }
            }
          }

          Object.keys(formattedTransaction.categories).forEach(function(key) {
            formattedTransaction.amount += +formattedTransaction.categories[
              key
            ];
          });

          Object.keys(formattedWeights.trans_object).forEach(function(key) {
            formattedWeights.amount += +formattedWeights.trans_object[key];
          });

          if (formattedTransaction.amount > 0) {
            if (req.params.type == "ded") {
              var balance = member.balance - formattedTransaction.amount;
            } else if (req.params.type == "add") {
              var balance = +member.balance + +formattedTransaction.amount;
            }

            if (balance >= 0) {
              if (
                (formattedWeights.amount <= 0 && req.params.type == "add") ||
                (formattedWeights.amount > 0 && req.params.type == "ded")
              ) {
                formattedTransaction.categories = JSON.stringify(
                  formattedTransaction.categories
                );
                Transactions.add(formattedTransaction, function(err) {
                  if (err) {
                    message.status = "fail";
                    message.msg = "Something went wrong!";
                    res.send(message);
                  } else {
                    Members.updateBalance(
                      req.params.member_id,
                      balance,
                      function(err) {
                        if (err) {
                          message.status = "fail";
                          message.msg = "Something went wrong!";
                          res.send(message);
                        } else {
                          Members.updateActiveSwapperStatus(
                            req.params.member_id,
                            1,
                            function(err) {
                              if (req.params.type == "ded") {
                                formattedWeights.trans_object = JSON.stringify(
                                  formattedWeights.trans_object
                                );
                                Carbon.add(formattedWeights, function(err) {
                                  if (err) {
                                    message.status = "fail";
                                    message.msg = "Something went wrong!";
                                    res.send(message);
                                  } else {
                                    totalCarbon = 0;
                                    Settings.getAll(function(err, settings) {
                                      settings = settings[0];
                                      settings.definitions = JSON.parse(
                                        settings.definitions
                                      );
                                      formattedWeights.trans_object = JSON.parse(
                                        formattedWeights.trans_object
                                      );

                                      Object.keys(
                                        formattedWeights.trans_object
                                      ).forEach(function(key) {
                                        for (
                                          let j = 0;
                                          j < settings.definitions.items.length;
                                          j++
                                        ) {
                                          if (
                                            key ==
                                            settings.definitions.items[j].id
                                          ) {
                                            totalCarbon +=
                                              formattedWeights.trans_object[
                                                key
                                              ] *
                                              settings.definitions.items[j]
                                                .factor *
                                              1e-3;
                                          }
                                        }
                                      });

                                      message.status = "ok";
                                      message.msg =
                                        "Transaction complete! " +
                                        totalCarbon.toFixed(2) +
                                        "kg of carbon saved";
                                      res.send(message);
                                    });
                                  }
                                });
                              } else {
                                message.status = "ok";
                                message.msg = "Transaction complete!";
                                res.send(message);
                              }
                            }
                          );
                        }
                      }
                    );
                  }
                });
              } else {
                message.status = "fail";
                message.msg = "Please enter a total weight greater than 0";
                res.send(message);
              }
            } else {
              message.status = "fail";
              message.msg = member.first_name + " doesn't have enough tokens!";
              res.send(message);
            }
          } else {
            message.status = "fail";
            message.msg =
              "Please enter a total amount of tokens greater than 0";
            res.send(message);
          }
        } else if (req.params.type == "ded" && !useTokens) {
          var transaction = req.body.transaction;

          var formattedWeights = {};
          formattedWeights.member_id = req.params.member_id;
          formattedWeights.trans_object = {};
          formattedWeights.amount = 0;

          for (let i = 0; i < transaction.length; i++) {
            if (
              !isNaN(parseFloat(transaction[i].weight)) &&
              transaction[i].weight > 0
            ) {
              if (formattedWeights.trans_object[transaction[i].id] == null) {
                formattedWeights.trans_object[transaction[i].id] =
                  transaction[i].weight;
              } else {
                formattedWeights.trans_object[transaction[i].id] =
                  +transaction[i].weight +
                  +formattedWeights.trans_object[transaction[i].id];
              }
            }
          }

          Object.keys(formattedWeights.trans_object).forEach(function(key) {
            formattedWeights.amount += +formattedWeights.trans_object[key];
          });

          if (formattedWeights.amount > 0) {
            formattedWeights.trans_object = JSON.stringify(
              formattedWeights.trans_object
            );
            Carbon.add(formattedWeights, function(err) {
              if (err) {
                message.status = "fail";
                message.msg = "Something went wrong!";
                res.send(message);
              } else {
                totalCarbon = 0;
                Settings.getAll(function(err, settings) {
                  settings = settings[0];
                  settings.definitions = JSON.parse(settings.definitions);
                  formattedWeights.trans_object = JSON.parse(
                    formattedWeights.trans_object
                  );

                  Object.keys(formattedWeights.trans_object).forEach(function(
                    key
                  ) {
                    for (
                      let j = 0;
                      j < settings.definitions.items.length;
                      j++
                    ) {
                      if (key == settings.definitions.items[j].id) {
                        totalCarbon +=
                          formattedWeights.trans_object[key] *
                          settings.definitions.items[j].factor *
                          1e-3;
                      }
                    }
                  });

                  message.status = "ok";
                  message.msg =
                    "Transaction complete! " +
                    totalCarbon.toFixed(2) +
                    "kg of carbon saved";
                  res.send(message);
                });
              }
            });
          } else {
            message.status = "fail";
            message.msg = "Please enter a total weight greater than 0g";
            res.send(message);
          }
        } else if (req.params.type != "ded" && !useTokens) {
          message.status = "fail";
          message.msg = "No need to log incoming weights!";
          res.send(message);
        } else {
          message.status = "fail";
          message.msg = "Something went wrong!";
          res.send(message);
        }
      } else {
        message.status = "fail";
        message.msg = "Invalid type!";
        res.send(message);
      }
    } else {
      message.status = "fail";
      message.msg = "Member not found!";
      res.send(message);
    }
  });
});

module.exports = router;
