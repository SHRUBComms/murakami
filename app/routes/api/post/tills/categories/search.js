// /api/post/tills/categories/search

var router = require("express").Router();
var async = require("async");

var rootDir = process.env.CWD;

var Tills = require(rootDir + "/app/models/tills");

var Auth = require(rootDir + "/app/configs/auth");
var Helpers = require(rootDir + "/app/configs/helpful_functions");

router.post("/", Auth.isLoggedIn, function(req, res) {
  var response = {};
  response.status = "fail";
  response.results = [];

  var term = req.body.term;
  var till_id = req.body.till_id;
  Tills.getCategoriesByTillId(till_id, "tree", function(err, categories) {
    if (err || !categories) {
      res.send(response);
    } else {
      categories = Helpers.flatten(categories);
      var results = [];
      async.each(
        categories,
        function(category, callback) {
          if (category.name.toLowerCase().search(term.toLowerCase()) != -1) {
            results.push(category);
          }
          callback();
        },
        function() {
          response.status = "ok";
          response.results = results.slice(0, 3);
          res.send(response);
        }
      );
    }
  });
});

module.exports = router;
