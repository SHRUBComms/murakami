// /settings

var router = require("express").Router();

var rootDir = process.env.CWD;

var Auth = require(rootDir + "/app/configs/auth");

router.get("/", Auth.isLoggedIn, Auth.isOfClass(["admin"]), function(req, res) {
  res.redirect(process.env.PUBLIC_ADDRESS + "/settings/email-templates");
});

router.use("/email-templates", require("./email-templates"));
router.use("/static-content", require("./static-content"));
router.use("/data-permissions", require("./data-permissions"));

module.exports = router;
