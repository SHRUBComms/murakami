// /api/get/reports/this-month/new-volunteers

var router = require("express").Router();

var rootDir = process.env.CWD;

var Members = require(rootDir + "/app/models/members");

router.get("/", function(req, res) {
  Members.getNewVolsThisMonth(function(err, members) {
    res.send(members.length.toString());
  });
});

module.exports = router;
