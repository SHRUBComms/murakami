// /api/post/tills/categories/add

var router = require("express").Router();
var lodash = require("lodash");

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");
var Tills = Models.Tills;
var StockCategories = Models.StockCategories;
var Carbon = Models.Carbon;
var CarbonCategories = Models.CarbonCategories;

var Auth = require(rootDir + "/app/configs/auth");

router.post(
  "/",
  Auth.isLoggedIn,
  Auth.canAccessPage("tills", "updateCategories"),
  function(req, res) {
    var response = { status: "fail", msg: "Something went wrong!" };

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
              if (category.name) {
                sanitizedCategory.name = lodash.startCase(
                  lodash.camelCase(category.name.trim())
                );
                CarbonCategories.getAll(function(err, carbonCategories) {
                  if (
                    carbonCategories[category.carbon_id] ||
                    !category.carbon_id
                  ) {
                    sanitizedCategory.carbon_id = category.carbon_id;
                    StockCategories.getCategoriesByTillId(
                      category.till_id,
                      "kv",
                      function(err, categories) {
                        console.log(category);
                        if (categories[category.parent] || !category.parent) {
                          sanitizedCategory.parent = category.parent;

                          if (category.group_id) {
                            if (
                              req.user.allWorkingGroupsObj[category.group_id]
                            ) {
                              sanitizedCategory.group_id = category.group_id;
                            }
                          }

                          if (category.value > 0 || !category.value) {
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

                            if (category.needsCondition == 1) {
                              sanitizedCategory.needsCondition = 1;
                            } else {
                              sanitizedCategory.needsCondition = 0;
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
                      }
                    );
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
            } else {
              response.msg = "You're not permitted to do that!";
              res.send(response);
            }
          } else {
            response.msg = "Till is disabled!";
            res.send(response);
          }
        } else {
          response.msg = "Select a valid till!";
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
