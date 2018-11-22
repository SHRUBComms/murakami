// /api/post/tills/update
var router = require("express").Router();

var rootDir = process.env.CWD;

var Tills = require(rootDir + "/app/models/tills");

var Auth = require(rootDir + "/app/configs/auth");

router.post("/", Auth.isLoggedIn, function(req, res) {
  var response = { status: "fail", msg: "something went wrong!" };

  var till = req.body.till;

  if (till.name) {
    Tills.getTillById(till.till_id, function(err, tillExists) {
      if (till) {
        Tills.updateTill(till, function(err) {
          if (err) {
            res.send(response);
          } else {
            response.status = "ok";
            response.msg = "Till updated!";
            res.send(response);
          }
        });
      } else {
        response.msg = "Select a valid till.";
        res.send(response);
      }
    });
  } else {
    response.msg = "Please enter a name.";
    res.send(response);
  }
});

module.exports = router;