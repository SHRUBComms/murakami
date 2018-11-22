// /api/get/tills/categories

var router = require("express").Router();

var rootDir = process.env.CWD;

var Tills = require(rootDir + "/app/models/tills");

var Auth = require(rootDir + "/app/configs/auth");

router.get("/:till_id", Auth.isLoggedIn, function(req, res) {
  Tills.getCategoriesByTillId(req.params.till_id, "tree", function(
      err,
      categories
    ) {
    if (err) {
      res.send({});
    } else {
      res.send(categories);
    }
    
  });
});

module.exports = router;
