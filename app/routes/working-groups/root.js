// /working-groups

var router = require("express").Router();

var rootDir = process.env.CWD;

var WorkingGroups = require(rootDir + "/app/models/working-groups");

var Auth = require(rootDir + "/app/configs/auth");

router.get("/", Auth.isLoggedIn, function(req, res) {
  res.redirect(process.env.PUBLIC_ADDRESS + "/working-groups/manage");
});

router.use("/add", require("./add"));
router.use("/manage", require("./manage"));

module.exports = router;
