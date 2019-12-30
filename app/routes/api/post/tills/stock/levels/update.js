// /api/post/tills/stock/levels/update

var router = require("express").Router();
var async = require("async");

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");
var Tills = Models.Tills;
var TillActivity = Models.TillActivity;
var CarbonCategories = Models.CarbonCategories;
var StockCategories = Models.StockCategories;
var StockRecords = Models.StockRecords;

var Auth = require(rootDir + "/app/configs/auth");
var Helpers = require(rootDir + "/app/helper-functions/root");

router.post(
  "/:till_id",
  Auth.isLoggedIn,
  Auth.canAccessPage("tills", "manageStock"),
  function(req, res) {
    var response = {};
    response.status = "fail";
    response.msg = "";

    var summary = req.body.summary;
    var note = req.body.note;

    var sanitizedSummary = {};

    if (summary) {
      Tills.getById(req.params.till_id, function(err, till) {
        if (till) {
          if (
            req.user.permissions.tills.manageStock == true ||
            (req.user.permissions.tills.manageStock == "commonWorkingGroup" &&
              req.user.working_groups.includes(till.group_id))
          ) {
            TillActivity.getByTillId(till.till_id, function(status) {
              till.status = status.opening;
              StockCategories.getCategoriesByTillId(
                req.params.till_id,
                "kv",
                function(err, categories) {
                  var categoriesToUpdate = {};

                  async.eachOf(
                    summary,
                    function(category, category_id, callback) {
                      if (categories[category_id]) {
                        if (categories[category_id].conditions.length > 0) {
                          if (
                            categories[category_id].active &&
                            categories[category_id].stockControl &&
                            categories[category_id].stockInfo
                          ) {
                            sanitizedSummary[category_id] = {};

                            async.eachOf(
                              category,
                              function(subcategory, condition, callback) {
                                if (
                                  categories[category_id].conditions.includes(
                                    condition
                                  )
                                ) {
                                  var quantity = 0;
                                  if (
                                    Number.isInteger(
                                      Number(subcategory.qtyModifier)
                                    )
                                  ) {
                                    quantity = subcategory.qtyModifier;
                                  } else {
                                    quantity = 0;
                                  }

                                  if (quantity != 0) {
                                    var oldQty = 0;
                                    if (
                                      categories[category_id].stockInfo[
                                        condition
                                      ]
                                    ) {
                                      oldQty =
                                        categories[category_id].stockInfo[
                                          condition
                                        ].quantity;
                                    }

                                    sanitizedSummary[category_id][condition] = {
                                      oldQty: oldQty,
                                      qtyModifier: quantity,
                                      newQty: Number(oldQty) + Number(quantity)
                                    };
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
                    },
                    function() {
                      async.eachOf(
                        sanitizedSummary,
                        function(category, category_id, callback) {
                          var newStockInfo = categories[category_id].stockInfo;
                          async.eachOf(
                            category,
                            function(subcategory, condition, callback) {
                              if (subcategory.newQty >= 0) {
                                newStockInfo[condition].quantity =
                                  subcategory.newQty;
                                StockCategories.updateQuantity(
                                  category_id,
                                  newStockInfo,
                                  function(err) {
                                    if (!err) {
                                      var record = {
                                        item_id: category_id,
                                        condition: condition,
                                        user_id: req.user.id,
                                        till_id: till.till_id,
                                        actionInfo: {
                                          method: "manual",
                                          summary: subcategory,
                                          note: note || null
                                        }
                                      };
                                      
                                      StockRecords.addRecord(record, function(
                                        err
                                      ) {
                                        if (!err) {
                                          callback();
                                        } else {
                                          throw new Error("Can't add record.");
                                        }
                                      });
                                    } else {
                                      callback();
                                    }
                                  }
                                );
                              } else {
                                callback();
                              }
                            },
                            function() {
                              callback();
                            }
                          );
                        },
                        function() {
                          response.status = "ok";
                          response.msg = "Stock levels updated successfully!";
                          res.send(response);
                        }
                      );
                    }
                  );
                }
              );
            });
          } else {
            response.msg = "You don't have permission to update stock levels.";
            res.send(response);
          }
        } else {
          response.msg = "Can't find till.";
          res.send(response);
        }
      });
    } else {
      response.msg = "Please enter a valid request.";
      res.send(response);
    }
  }
);

module.exports = router;
