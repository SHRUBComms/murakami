// /api/get/tills/smp-callback

var router = require("express").Router();
var async = require("async");
var request = require("request");

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");
var Tills = Models.Tills;
var Transactions = Models.Transactions;

var Auth = require(rootDir + "/app/configs/auth");

router.get("/", Auth.isLoggedIn, function(req, res) {
  var redirectUri =
    process.env.PUBLIC_ADDRESS +
    "/till/transaction/" +
    req.query.till_id +
    "/?" +
    "sumupCallback=true" +
    "&murakamiStatus=" +
    req.query.murakamiStatus +
    "&transactionSummary=" +
    req.query.transactionSummary +
    "&carbonSummary=" +
    req.query.carbonSummary +
    "&smp-status=" +
    req.query["smp-status"] +
    "&smp-failure-cause=" +
    req.query["smp-failure-cause"];
  request.post(
    "https://api.sumup.com/token",
    {
      json: {
        grant_type: "password",
        client_id: process.env.SUMUP_CLIENT_ID,
        client_secret: process.env.SUMUP_CLIENT_SECRET,
        username: process.env.SUMUP_USERNAME,
        password: process.env.SUMUP_PASSWORD
      }
    },
    (error, response, body) => {
      if (error || response.statusCode != 200) {
        res.redirect(
          process.env.PUBLIC_ADDRESS +
            "/till/transaction/" +
            req.query.till_id +
            "/?" +
            "sumupCallback=true" +
            "&murakamiStatus=" +
            req.query.murakamiStatus +
            "&transactionSummary=" +
            req.query.transactionSummary +
            "&carbonSummary=" +
            req.query.carbonSummary +
            "&smp-status=failed" +
            "&smp-failure-cause=Could not verify card payment."
        );
      } else {
        request.get(
          "https://api.sumup.com/v0.1/me/transactions?transaction_code=" +
            req.query["smp-tx-code"],
          {
            headers: {
              authorization: "Bearer " + body.access_token
            }
          },
          (error, response, body) => {
            body = JSON.parse(body);
            if (body.status == "FAILED") {
              Tills.getById(req.query.till_id, function(err, till) {
                Transactions.removeTransaction(
                  req.query["foreign-tx-id"],
                  till.group_id,
                  function(err) {
                    res.redirect(redirectUri);
                  }
                );
              });
            } else {
              res.redirect(redirectUri);
            }
          }
        );
      }
    }
  );
});

module.exports = router;
