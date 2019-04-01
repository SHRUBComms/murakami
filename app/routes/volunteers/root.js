// /volunteers

var router = require("express").Router();

var rootDir = process.env.CWD;

var Auth = require(rootDir + "/app/configs/auth");

router.get("/", Auth.isLoggedIn, Auth.isOfClass(["admin"]), function(req, res) {
  res.redirect(process.env.PUBLIC_ADDRESS + "/volunteers/manage");
});

router.use("/hours", require("./hours/root"));
router.use("/roles", require("./roles/root"));

router.use("/manage", require("./manage"));
router.use("/add", require("./add"));
router.use("/view", require("./view"));
router.use("/update", require("./update"));
router.use("/check-in", require("./check-in"));
router.use("/invite", require("./invite/root"));

module.exports = router;
