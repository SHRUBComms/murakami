// /settings

var router = require("express").Router();

var rootDir = process.env.CWD;

var Settings = require(rootDir + "/app/models/settings");

var Auth = require(rootDir + "/app/configs/auth");

router.get('/', Auth.isLoggedIn, Auth.isAdmin, function (req, res) {
	res.redirect("/settings/general");
});

router.use("/working-groups", require("./working-groups"))
router.use("/carbon-factors", require("./carbon-factors"))
router.use("/general", require("./general"))
router.use("/email-templates", require("./email-templates"))

module.exports = router;