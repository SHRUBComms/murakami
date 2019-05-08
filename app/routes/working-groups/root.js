// /working-groups

var router = require("express").Router();

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");
var WorkingGroups = Models.WorkingGroups;

var Auth = require(rootDir + "/app/configs/auth");

router.get("/", Auth.isLoggedIn, function(req, res) {
  res.redirect(process.env.PUBLIC_ADDRESS + "/working-groups/manage");
});

router.use("/add", require("./add"));
router.use("/manage", require("./manage"));

module.exports = router;
