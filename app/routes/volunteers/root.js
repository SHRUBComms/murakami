// /working-groups

var router = require("express").Router();

var rootDir = process.env.CWD;

var Auth = require(rootDir + "/app/configs/auth");

router.get("/", Auth.isLoggedIn, Auth.isOfClass(["admin"]), function(req, res) {
  res.redirect("/volunteers/dashboard");
});

router.use("/review-volunteer-hours", require("./review-volunteer-hours"));
router.use("/find-a-volunteer", require("./find-a-volunteer"));
router.use("/induct-volunteers", require("./induct-volunteers"));
router.use("/log-volunteer-hours", require("./log-volunteer-hours"));
router.use("/roles", require("./roles/root"));
router.use("/manage", require("./manage"));

module.exports = router;
