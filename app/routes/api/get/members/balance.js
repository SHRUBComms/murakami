// /api/get/members/balance

var router = require("express").Router();

var rootDir = process.env.CWD;

var Members = require(rootDir + "/app/models/members");

var Auth = require(rootDir + "/app/configs/auth");

router.get("/:member_id", Auth.canAccessPage("members", "balance"), function(
  req,
  res
) {
  Members.getById(req.params.member_id, req.user, function(err, member) {
    if (err || !member) {
      res.send({ balance: 0 });
    } else {
      res.send({ balance: member.balance });
    }
  });
});

module.exports = router;
