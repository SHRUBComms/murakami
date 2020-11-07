// /working-groups

const router = require("express").Router();

const rootDir = process.env.CWD;

const Auth = require(rootDir + "/app/controllers/auth");

router.get("/", Auth.isLoggedIn, (req, res) => {
  res.redirect(process.env.PUBLIC_ADDRESS + "/working-groups/manage");
});

router.use("/add", require("./add"));
router.use("/manage", require("./manage"));

module.exports = router;
