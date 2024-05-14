// /till

const router = require("express").Router();

const rootDir = process.env.CWD;

const Auth = require(rootDir + "/app/controllers/auth");

router.get("/", Auth.isLoggedIn, (req, res) => {
  res.redirect(process.env.PUBLIC_ADDRESS + "/till/select");
});

router.use("/transaction", require("./transaction"));
router.use("/donations", require("./donations"));
router.use("/open", require("./open"));
router.use("/dashboard", require("./dashboard"));
router.use("/manage", require("./manage"));
router.use("/close", require("./close"));
router.use("/add", require("./add"));
router.use("/select", require("./select"));
router.use("/reports", require("./reports"));
router.use("/refunds", require("./refunds/root"));
router.use("/receipt", require("./receipt/root"));
router.use("/return-yoyo-cup", require("./return-yoyo-cup/root"));

router.use("/stock", require("./stock/root"));

module.exports = router;
