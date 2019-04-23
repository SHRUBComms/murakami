// /api/post/tills/categories/remove

var router = require("express").Router();

var rootDir = process.env.CWD;

var Tills = require(rootDir + "/app/models/tills");

var Auth = require(rootDir + "/app/configs/auth");

router.post(
  "/",
  Auth.isLoggedIn,
  Auth.canAccessPage("tills", "updateCategories"),
  function(req, res) {
    var response = { status: "fail", msg: "something went wrong!" };

    var till_id = req.body.till_id;
    var item_id = req.body.item_id;

    if (till_id) {
      Tills.getTillById(till_id, function(err, till) {
        if (till) {
          if (
            req.user.permissions.tills.updateCategories == true ||
            (req.user.permissions.tills.updateCategories ==
              "commonWorkingGroup" &&
              req.user.working_groups.includes(till.group_id))
          ) {
            if (item_id) {
              Tills.getCategoriesByTillId(till_id, "kv", function(
                err,
                categories
              ) {
                if (categories[item_id]) {
                  Tills.removeCategory(item_id, function(err) {
                    if (err) {
                      res.send(response);
                    } else {
                      response.status = "ok";
                      response.msg = "Category removed!";
                      res.send(response);
                    }
                  });
                } else {
                  response.msg = "Select a valid category!";
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
          response.msg = "Select a valid till!";
          res.send(response);
        }
      });
    } else {
      response.msg = "Please enter a category!";
      res.send(response);
    }
  }
);

module.exports = router;
