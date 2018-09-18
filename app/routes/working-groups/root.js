// /working-groups

var router = require("express").Router();

var rootDir = process.env.CWD;

var Auth = require(rootDir + "/app/configs/auth");

router.get('/', Auth.isLoggedIn, Auth.isAdmin, function (req, res) {
  res.redirect("/working-groups/members");
});

router.use("/members", require("./members"))
router.use("/add-members", require("./add-members"))
router.use("/review-join-requests", require("./review-join-requests"))
router.use("/review-volunteer-hours", require("./review-volunteer-hours"))
router.use("/log-volunteer-hours", require("./log-volunteer-hours"))

module.exports = router;