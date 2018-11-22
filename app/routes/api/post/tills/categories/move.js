// /api/post/tills/categories/move

var router = require("express").Router();

var rootDir = process.env.CWD;

var Tills = require(rootDir + "/app/models/tills");

var Auth = require(rootDir + "/app/configs/auth");

router.post("/", function(req, res) {
  var response = { status: "fail", msg: "something went wrong!" };

  var till_id = req.body.till_id;
  var item_id = req.body.item_id;
  var newParent = req.body.newParent;

  if (till_id) {
    Tills.getTillById(till_id, function(err, till) {
      if (till) {
        if (item_id) {

              Tills.getCategoriesByTillId(till_id, "kv", function(
                err,
                categories
              ) {
                if (categories[item_id]) {
                  if (categories[newParent]) {
                    if (newParent != item_id) {

                      Tills.moveCategory(item_id, newParent, function(err) {
                        if (err) {
                          res.send(response);
                        } else {
                          response.status = "ok";
                          response.msg = "Category moved!";
                          res.send(response);
                        }
                      }); 
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
        response.msg = "Select a valid till!";
        res.send(response);
      }
    });
  } else {
    response.msg = "Please enter a category";
    res.send(response);
  }
});

module.exports = router;
