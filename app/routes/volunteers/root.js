// /working-groups

var router = require("express").Router();

var rootDir = process.env.CWD;

var Auth = require(rootDir + "/app/configs/auth");

router.get("/", Auth.isLoggedIn, Auth.isOfClass(["admin"]), function(req, res) {
  res.redirect("/volunteers/dashboard");
});

router.use("/review-hours", require("./review-hours"));
router.use("/find-a-volunteer", require("./find-a-volunteer"));
router.use("/induct-volunteers", require("./induct-volunteers"));
router.use("/log-hours", require("./log-hours"));
router.use("/roles", require("./roles/root"));
router.use("/manage", require("./manage"));
router.use("/add", require("./add"));
router.use("/view", require("./view"));
router.use("/update", require("./update"));

module.exports = router;
