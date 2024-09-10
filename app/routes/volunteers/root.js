// /volunteers

const router = require("express").Router();

const rootDir = process.env.CWD;

const Auth = require(rootDir + "/app/controllers/auth");

router.get("/", Auth.isLoggedIn, Auth.canAccessPage("volunteers", "view"), (req, res) => {
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
