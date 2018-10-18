// /reports

var router = require("express").Router();

var rootDir = process.env.CWD;

var Auth = require(rootDir + "/app/configs/auth");

router.get('/', Auth.isLoggedIn, Auth.isAdmin, function (req, res) {
	res.send("Under construction!");
});

router.use("/carbon", require("./carbon"))

module.exports = router;