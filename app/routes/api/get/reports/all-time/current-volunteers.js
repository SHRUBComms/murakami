// /api/get/reports/all-time/current-volunteers

var router = require("express").Router();

var rootDir = process.env.CWD;

var Members = require(rootDir + "/app/models/members");

router.get("/", function(req, res) {
  Members.getAllVolunteers(function(err, members) {
    res.send(members.length.toString());
  });
});

module.exports = router;
