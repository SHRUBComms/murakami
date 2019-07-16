// /api/post/tills/categories/move

var router = require("express").Router();

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");
var Tills = Models.Tills;
var StockCategories = Models.StockCategories;

var Auth = require(rootDir + "/app/configs/auth");

router.post(
  "/",
  Auth.isLoggedIn,
  Auth.canAccessPage("tills", "updateCategories"),
  function(req, res) {
    var response = { status: "fail", msg: "something went wrong!" };

    var till_id = req.body.till_id;
    var item_id = req.body.item_id;
    var newParent = req.body.newParent;

    if (till_id) {
      Tills.getById(till_id, function(err, till) {
        if (till) {
          if (till.disabled == 0) {
            if (
              req.user.permissions.tills.updateCategories == true ||
              (req.user.permissions.tills.updateCategories ==
                "commonWorkingGroup" &&
                req.user.working_groups.includes(till.group_id))
            ) {
              if (item_id) {
                StockCategories.getCategoriesByTillId(till_id, "kv", function(
                  err,
                  categories
                ) {
                  if (categories[item_id]) {
                    if (categories[newParent]) {
                      if (newParent != item_id) {
                        StockCategories.moveCategory(
                          item_id,
                          newParent,
                          function(err) {
                            if (err) {
                              res.send(response);
                            } else {
                              response.status = "ok";
                              response.msg = "Category moved!";
                              res.send(response);
                            }
                          }
                        );
                      } else {
                        response.msg = "Category cannot be it's own parent.";
                        res.send(response);
                      }
                    } else {
                      response.msg = "Select a valid parent.";
                      res.send(response);
                    }
                  } else {
                    response.msg = "Select a valid category";
                    res.send(response);
                  }
                });
              } else {
                response.msg = "Please select a category!";
                res.send(response);
              }
            } else {
              response.msg = "You don't have permission to do that!";
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
