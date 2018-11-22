// /api/get/reports/today/swaps

var router = require("express").Router();

var rootDir = process.env.CWD;

var Transactions = require(rootDir + "/app/models/transactions");

var Auth = require(rootDir + "/app/configs/auth");

router.get("/", Auth.isLoggedIn, function(req, res) {
  Transactions.getSwapsToday(function(err, transactions) {
    if (transactions) {
      res.send(transactions.length.toString());
    } else {
      res.send("0");
    }
  });
});

module.exports = router;
