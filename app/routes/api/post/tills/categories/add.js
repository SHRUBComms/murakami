// /api/post/tills/categories/add

var router = require("express").Router();

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
    if (category) {
      Tills.getById(category.till_id, function(err, till) {
        if (till) {
          if (
            req.user.permissions.tills.updateCategories == true ||
            (req.user.permissions.tills.updateCategories ==
              "commonWorkingGroup" &&
              req.user.working_groups.includes(till.group_id))
          ) {
            if (category.name) {
              CarbonCategories.getAll(function(err, carbonCategories) {
                if (
                  carbonCategories[category.carbon_id] ||
                  !category.carbon_id
                ) {
                  StockCategories.getCategoriesByTillId(
                    category.till_id,
                    "kv",
                    function(err, categories) {
                      if (categories[category.parent] || !category.parent) {
                        if (category.value > 0 || !category.value) {
                          if (
                            category.allowTokens != 1 ||
                            category.allowTokens != 0
                          ) {
                            category.allowTokens = 0;
                          }

                          if (
                            category.member_discount < 0 &&
                            category.member_discount > 100
                          ) {
                            category.member_discount = 0;
                          }

                          if (category.weight < 0 || category.weight > 100000) {
                            category.weight = 0;
                          }

                          if (category.needsCondition != 1) {
                            category.needsCondition = 0;
                          }

                          category.value = category.value || null;

                          StockCategories.addCategory(category, function(
                            err,
                            id
                          ) {
                            if (err) {
                              res.send(response);
                            } else {
                              response.status = "ok";
                              response.msg = "Category added!";
                              response.newId = id;
                              res.send(response);
                            }
                          });
                        } else {
                          response.msg = "Enter a valid value or leave blank!";
                          res.send(response);
                        }
                      } else {
                        response.msg = "Select a valid parent or leave blank!";
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
