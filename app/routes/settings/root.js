// /settings

const router = require("express").Router();

const rootDir = process.env.CWD;

const Auth = require(rootDir + "/app/controllers/auth");

router.get("/", Auth.isLoggedIn, Auth.isOfClass(["admin"]), (req, res) => {
  res.redirect(process.env.PUBLIC_ADDRESS + "/settings/email-templates");
});

router.use("/email-templates", require("./email-templates"));
router.use("/static-content", require("./static-content"));
router.use("/data-permissions", require("./data-permissions"));

module.exports = router;
