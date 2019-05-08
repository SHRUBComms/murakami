// /api/get/members/balance

var router = require("express").Router();

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");

var Members = Models.Members;

var Auth = require(rootDir + "/app/configs/auth");

router.get("/:member_id", Auth.canAccessPage("members", "balance"), function(
  req,
  res
) {
  Members.getById(req.params.member_id, req.user, function(err, member) {
    if (err || !member) {
      res.send({ balance: 0 });
    } else {
      res.send({ balance: member.balance || 0 });
    }
  });
});

module.exports = router;
