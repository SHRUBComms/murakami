// /api/get/tills/smp-callback

var router = require("express").Router();
var async = require("async");
var request = require("request");

var rootDir = process.env.CWD;

var Tills = require(rootDir + "/app/models/tills");

var Auth = require(rootDir + "/app/configs/auth");

router.get("/", Auth.isLoggedIn, function(req, res) {
  // Check transaction status via SumUp API

  request.post('https://api.sumup.com/token', {
    json:
      {
        grant_type: "password",
        client_id: process.env.SUMUP_CLIENT_ID,
        client_secret: process.env.SUMUP_CLIENT_SECRET,
        username: process.env.SUMUP_USERNAME,
        password: process.env.SUMUP_PASSWORD
      }
  }, (error, response, body) => {
    if (error || response.statusCode != 200) {
      return
    } else {
      request.get('https://api.sumup.com/v0.1/me/transactions?transaction_code=' + req.query["smp-tx-code"], {
        headers: {
          authorization: "Bearer " + body.access_token
        }
      }, (error, response, body) => {
        body = JSON.parse(body)
        if(body.status == "FAILED"){

          Tills.getTillById(req.query.till_id, function(err, till){
            Tills.removeTransaction(req.query["foreign-tx-id"], till.group_id, function(err){

            })
          })
        }
      })
    }

  })
  console.log(req.query.till_id);
  res.redirect(
    process.env.PUBLIC_ADDRESS + "/till/" + req.query.till_id + "/?" +
      "murakamiStatus=" + req.query["murakamiStatus"] +
      "&murakamiMsg=" + req.query["murakamiMsg"] +
      "&smp-status=" + req.query["smp-status"] +
      "&smp-failure-cause=" + req.query["smp-failure-cause"]
  );
});

module.exports = router;
