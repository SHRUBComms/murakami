// /carbon-accounting/log

var router = require("express").Router();
var async = require("async");

var rootDir = process.env.CWD;

var Carbon = require(rootDir + "/app/models/carbon-calculations");
var WorkingGroups = require(rootDir + "/app/models/working-groups");

var Auth = require(rootDir + "/app/configs/auth");
var Helpers = require(rootDir + "/app/configs/helpful_functions");

router.get(
  "/",
  Auth.isLoggedIn,
  Auth.canAccessPage("carbonAccounting", "log"),
  function(req, res) {
    WorkingGroups.getAll(function(err, working_groups) {
      Carbon.getCategories(function(err, carbonCategories) {
        carbonCategories = Object.values(carbonCategories);
        var tillMode = false;
        var till_id = req.query.till_id || null;
        if (till_id) {
          tillMode = true;
        }
        res.render("carbon-accounting/log", {
          tillMode: tillMode,
          till: {
            till_id: till_id
          },
          carbonActive: true,
          title: "Log Outgoing Weight",
          carbonCategories: carbonCategories,
          working_groups: working_groups,
          till: {
            till_id: req.query.till_id
          }
        });
      });
    });
  }
);

router.post(
  "/",
  Auth.isLoggedIn,
  Auth.canAccessPage("carbonAccounting", "log"),
  function(req, res) {
    var message = {
      status: "fail",
      msg: null
    };

    var transaction = req.body.transaction;
    var formattedTransaction = {};
    formattedTransaction.member_id = "anon";
    formattedTransaction.user_id = req.user.id;
    formattedTransaction.trans_object = {};
    formattedTransaction.amount = 0;

    if (
      req.user.permissions.carbonAccounting.log == true ||
      (req.user.permissions.carbonAccounting.log == "commonWorkingGroup" &&
        req.user.working_groups.includes(req.body.working_group))
    ) {
      formattedTransaction.group_id = req.body.working_group;
    }

    formattedTransaction.method = req.body.method;

    var validMethods = [
      "recycled",
      "generated",
      "landfilled",
      "incinerated",
      "composted",
      "reused",
      "stored",
      "other"
    ];

    WorkingGroups.getAll(function(err, working_groups) {
      if (working_groups[formattedTransaction.group_id]) {
        if (validMethods.indexOf(formattedTransaction.method) !== -1) {
          Carbon.getCategories(function(err, carbonCategoriesRaw) {
            carbonCategories = {};
            async.each(
              carbonCategoriesRaw,
              function(category, callback) {
                carbonCategories[category.carbon_id] = category.factors;
                callback();
              },
              function() {
                for (let i = 0; i < transaction.length; i++) {
                  if (
                    !isNaN(parseFloat(transaction[i].weight)) &&
                    transaction[i].weight > 0 &&
                    carbonCategories[transaction[i].id]
                  ) {
                    if (
                      formattedTransaction.trans_object[transaction[i].id] ==
                      null
                    ) {
                      formattedTransaction.trans_object[transaction[i].id] =
                        transaction[i].weight;
                    } else {
                      formattedTransaction.trans_object[transaction[i].id] =
                        +transaction[i].weight +
                        +formattedTransaction.trans_object[transaction[i].id];
                    }
                  }
                }
              }
            );

            Object.keys(formattedTransaction.trans_object).forEach(function(
              key
            ) {
              formattedTransaction.amount += +formattedTransaction.trans_object[
                key
              ];
            });

            if (formattedTransaction.amount > 0) {
              formattedTransaction.trans_object = JSON.stringify(
                formattedTransaction.trans_object
              );
              Carbon.add(formattedTransaction, function(err) {
                if (err) {
                  message.status = "fail";
                  message.msg = "Something went wrong!";
                  res.send(message);
                } else {
                  totalCarbon = 0;

                  Helpers.calculateCarbon(
                    [formattedTransaction],
                    carbonCategoriesRaw,
                    function(totalCarbon) {
                      message.status = "ok";
                      message.msg =
                        "Weight logged! " +
                        Math.abs(totalCarbon).toFixed(2) +
                        "kg of carbon saved";
                      res.send(message);
                    }
                  );
                }
              });
            } else {
              message.status = "fail";
              message.msg = "Please enter a total weight greater than 0";
              res.send(message);
            }
          });
        } else {
          message.status = "fail";
          message.msg = "Please select a valid method.";
          res.send(message);
        }
      } else {
        message.status = "fail";
        message.msg = "Please select a valid working group.";
        res.send(message);
      }
    });
  }
);

module.exports = router;
