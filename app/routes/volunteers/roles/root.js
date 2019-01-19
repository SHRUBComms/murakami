// /working-groups

var router = require("express").Router();

var rootDir = process.env.CWD;

var Auth = require(rootDir + "/app/configs/auth");

router.get("/", Auth.isLoggedIn, Auth.isOfClass(["admin"]), function(req, res) {
  res.redirect("/volunteers/roles/manage");
});

router.use("/add", require("./add"));
router.use("/view", require("./view"));
router.use("/update", require("./update"));
router.use("/manage", require("./manage"));

module.exports = router;
