// /api/post/tills/categories/update
var router = require("express").Router();

var rootDir = process.env.CWD;

var Tills = require(rootDir + "/app/models/tills");
var Carbon = require(rootDir + "/app/models/carbon-calculations");

var Auth = require(rootDir + "/app/configs/auth");

router.post("/", Auth.isLoggedIn, function(req, res) {
  var response = { status: "fail", msg: "something went wrong!" };

  var category = req.body.category;
  if (category) {
    Tills.getAllCategories(function(err, categories) {
      if (categories[category.item_id]) {
        if (category.name) {
          Carbon.getCategories(function(err, carbonCategories) {
            if (carbonCategories[category.carbon_id] || !category.carbon_id) {
              if (categories[category.parent] || !category.parent) {
                if (category.value > 0 || !category.value) {
                  if (category.allowTokens != 1 && category.allowTokens != 0) {
                    category.allowTokens = 0;
                  }

                  category.value = category.value || null;

                  Tills.updateCategory(category, function(err) {
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
});

module.exports = router;
