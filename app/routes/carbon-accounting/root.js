// /carbon-accounting

const router = require("express").Router();

const rootDir = process.env.CWD;

const Auth = require(rootDir + "/app/controllers/auth");

router.get("/", Auth.isLoggedIn, (req, res) => {
  res.redirect(process.env.PUBLIC_ADDRESS + "/carbon-accounting/log");
});

router.use("/log", require("./log"));
router.use("/export", require("./export"));
router.use("/settings", require("./settings"));
router.use("/raw-csv-export", require("./raw-csv-export"));

module.exports = router;
