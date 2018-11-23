// /api/post/tills/categories/search

var router = require("express").Router();

var rootDir = process.env.CWD;

var Tills = require(rootDir + "/app/models/tills");

var Auth = require(rootDir + "/app/configs/auth");

router.post("/", Auth.isLoggedIn, function(req, res) {
  var response = {};
  response.status = "fail";
  response.results = [];

  var term = req.body.term;
  var till_id = req.body.till_id;
  Tills.searchCategories(term, till_id, function(err, categories) {
    if (err) {
      res.send(response);
    } else {
      response.status = "ok";
      response.results = categories;
      res.send(response);
    }
  });
});

module.exports = router;
