// /working-groups

var router = require("express").Router();

var rootDir = process.env.CWD;

var Auth = require(rootDir + "/app/configs/auth");

router.get("/", Auth.isLoggedIn, Auth.isOfClass(["admin"]), function(req, res) {
  res.redirect("/volunteers/dashboard");
});

router.use("/add", require("./add"));

module.exports = router;
