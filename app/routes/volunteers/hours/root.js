// /volunteers/hours

var router = require("express").Router();

var rootDir = process.env.CWD;

var Auth = require(rootDir + "/app/configs/auth");

router.get("/", Auth.isLoggedIn, Auth.isOfClass(["admin"]), function(req, res) {
  res.redirect(process.env.PUBLIC_ADDRESS + "/volunteers/hours/log");
});

router.use("/export", require("./export"));
router.use("/review", require("./review"));
router.use("/log", require("./log"));

module.exports = router;
