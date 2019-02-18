// /settings

var router = require("express").Router();

var rootDir = process.env.CWD;

var Auth = require(rootDir + "/app/configs/auth");

router.get("/", Auth.isLoggedIn, Auth.isOfClass(["admin"]), function(req, res) {
  res.redirect("/settings/general");
});

router.use("/working-groups", require("./working-groups/root"));
router.use("/carbon-factors", require("./carbon-factors"));
router.use("/email-templates", require("./email-templates"));
router.use("/tills", require("./tills/root"));
router.use("/static-content", require("./static-content"));

module.exports = router;
