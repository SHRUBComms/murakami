// /api/post/tills/categories/update
var router = require("express").Router();

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");
var Tills = Models.Tills;
var StockCategories = Models.StockCategories;
var CarbonCategories = Models.CarbonCategories;

var Auth = require(rootDir + "/app/configs/auth");

router.post(
  "/",
  Auth.isLoggedIn,
  Auth.canAccessPage("tills", "updateCategories"),
  function(req, res) {
    var response = { status: "fail", msg: "something went wrong!" };

    var category = req.body.category;
    var sanitizedCategory = {};

    if (category) {
      StockCategories.getAllCategories(function(err, categories) {
        if (categories[category.item_id]) {
          sanitizedCategory.item_id = category.item_id;
          if (category.name) {
            sanitizedCategory.name = category.name;
            CarbonCategories.getAll(function(err, carbonCategories) {
              if (carbonCategories[category.carbon_id] || !category.carbon_id) {
                sanitizedCategory.carbon_id = category.carbon_id;
                if (categories[category.parent] || !category.parent) {
                  sanitizedCategory.parent = category.parent;
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

                    if (category.weight < 0 || category.weight > 100000) {
                      sanitizedCategory.weight = 0;
                    } else {
                      sanitizedCategory.weight = category.weight;
                    }

                    if (category.needsCondition == 1) {
                      sanitizedCategory.needsCondition = 1;
                    } else {
                      sanitizedCategory.needsCondition = 0;
                    }

                    sanitizedCategory.value = sanitizedCategory.value || null;

                    StockCategories.updateCategory(sanitizedCategory, function(
                      err
                    ) {
                      if (err) {
                        res.send(response);
                      } else {
                        response.status = "ok";
                        response.msg = "Category updated!";
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
              } else {
                response.msg = "Select a valid carbon category or leave blank!";
                res.send(response);
              }
            });
          } else {
            response.msg = "Please enter a name!";
            res.send(response);
          }
        } else {
          response.msg = "Select a valid category";
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
