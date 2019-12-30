// /api/post/tills/categories/add
var router = require("express").Router();

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");
var Tills = Models.Tills;
var StockCategories = Models.StockCategories;
var CarbonCategories = Models.CarbonCategories;
var Tills = Models.Tills;

var Auth = require(rootDir + "/app/configs/auth");
var Helpers = require(rootDir + "/app/helper-functions/root");

router.post(
  "/",
  Auth.isLoggedIn,
  Auth.canAccessPage("tills", "updateCategories"),
  function(req, res) {
    var response = {
      status: "fail",
      msg: "something went wrong!"
    };

    var category = req.body.category;
    var sanitizedCategory = {};

    if (category) {
      Tills.getById(category.till_id, function(err, till) {
        if (till) {
          if (till.disabled == 0) {
            sanitizedCategory.till_id = category.till_id;
            if (
              req.user.permissions.tills.updateCategories == true ||
              (req.user.permissions.tills.updateCategories ==
                "commonWorkingGroup" &&
                req.user.working_groups.includes(till.group_id))
            ) {
              StockCategories.getAllCategories(function(err, categories) {

                sanitizedCategory.item_id = category.item_id;
                if (category.name) {
                  sanitizedCategory.name = category.name;
                  CarbonCategories.getAll(function(err, carbonCategories) {
                    if (
                      carbonCategories[category.carbon_id] ||
                      !category.carbon_id
                    ) {
                      sanitizedCategory.carbon_id = category.carbon_id;
                      if (categories[category.parent] || !category.parent) {
                        sanitizedCategory.parent = category.parent;

                        if (category.value > 0 || !category.value) {

                          if (category.group_id) {
                            if (
                              req.user.allWorkingGroupsObj[category.group_id]
                            ) {
                              sanitizedCategory.group_id = category.group_id;
                            }
                          }

                          sanitizedCategory.value = category.value;
                          if (category.allowTokens == 1) {
                            sanitizedCategory.allowTokens = 1;
                          } else {
                            sanitizedCategory.allowTokens = 0;
                          }

                          if (
                            category.member_discount < 0 &&
                            category.member_discount > 100
                          ) {
                            sanitizedCategory.member_discount = 0;
                          } else {
                            sanitizedCategory.member_discount =
                              category.member_discount;
                          }

                          if (
                            category.weight < 0 ||
                            category.weight > 100000
                          ) {
                            sanitizedCategory.weight = 0;
                          } else {
                            sanitizedCategory.weight = category.weight;
                          }

                          if (category.stockControl == 1) {
                            sanitizedCategory.stockControl = 1;
                          } else {
                            sanitizedCategory.stockControl = 0;
                          }

                          sanitizedCategory.stockInfo = {}

                          if (Array.isArray(category.conditions)) {
                            if (
                              Helpers.allBelongTo(
                                category.conditions,
                                Helpers.validItemConditions()
                              )
                            ) {
                              sanitizedCategory.conditions =
                                category.conditions;
                            } else {
                              sanitizedCategory.conditions = [];
                            }
                          } else {
                            sanitizedCategory.conditions = [];
                          }

                          if (sanitizedCategory.stockControl == 1) {

                            if (sanitizedCategory.conditions.length > 0) {
                              sanitizedCategory.conditions.forEach(function(
                                condition
                              ) {
                                sanitizedCategory.stockInfo[condition] = {
                                  quantity: 0
                                };
                              });
                            } else {
                              sanitizedCategory.stockControl = 0;
                            }
                          }

                          sanitizedCategory.value =
                            sanitizedCategory.value || null;

                          StockCategories.addCategory(
                            sanitizedCategory,
                            function(err, id) {
                              if (err) {
                                res.send(response);
                              } else {
                                response.status = "ok";
                                response.msg = "Category added!";
                                response.newId = id;
                                res.send(response);
                              }
                            }
                          );
                        } else {
                          response.msg =
                            "Enter a valid value or leave blank!";
                          res.send(response);
                        }
                      } else {
                        response.msg =
                          "Select a valid parent or leave blank!";
                        res.send(response);
                      }
                    } else {
                      response.msg =
                        "Select a valid carbon category or leave blank!";
                      res.send(response);
                    }
                  });
                } else {
                  response.msg = "Please enter a name!";
                  res.send(response);
                }

              });
            } else {
              response.msg =
                "You don't have permission to update stock categories on this till.";
              res.send(response);
            }
          } else {
            response.msg = "Please specify an active till.";
            res.send(response);
          }
        } else {
          response.msg = "Please specify a till.";
          res.send(response);
        }
      });
    } else {
      response.msg = "Please enter a category";
      res.send(response);
    }
  }
);

module.exports = router;
