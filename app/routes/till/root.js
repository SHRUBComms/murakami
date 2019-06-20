// /till

var router = require("express").Router();
var async = require("async");

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");
var Tills = Models.Tills;
var TillActivity = Models.TillActivity;
var Transactions = Models.Transactions;
var StockCategories = Models.StockCategories;
var WorkingGroups = Models.WorkingGroups;

var Auth = require(rootDir + "/app/configs/auth");

router.get("/", Auth.isLoggedIn, function(req, res) {
  res.redirect(process.env.PUBLIC_ADDRESS + "/till/select");
});

router.use("/transaction", require("./transaction"));
router.use("/donations", require("./donations"));
router.use("/open", require("./open"));
router.use("/manage", require("./manage"));
router.use("/close", require("./close"));
router.use("/add", require("./add"));
router.use("/view", require("./view"));
router.use("/select", require("./select"));
router.use("/reports", require("./reports"));

module.exports = router;
