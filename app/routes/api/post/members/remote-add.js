// /api/post/members/remote-add

var router = require("express").Router();
var async = require("async");
var request = require("request");

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");
var Tills = Models.Tills;
var Transactions = Models.Transactions;
var StockCategories = Models.StockCategories;

var Auth = require(rootDir + "/app/configs/auth");

router.post("/", function(req, res) {
  var membershipCategoryId = req.body.membershipCategoryId;

  StockCategories.getMembershipCategories(function(err, membershipCategories) {
    var membershipCategory = membershipCategories[membershipCategoryId];

    if (membershipCategory) {
      Transactions.addTransaction(
        {
          till_id: "website",
          user_id: "website",
          member_id: 1234,
          date: new Date(),
          summary: {
            bill: [
              {
                value: membershipCategory.value,
                item_id: membershipCategory.item_id,
                condition: null
              }
            ],
            totals: { money: membershipCategory.value },
            comment: "Processed through website."
          }
        },
        function(err, transaction_id) {
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
                res.send({ status: "fail", msg: "Authentication failed." });
              } else {
                request.post(
                  "https://api.sumup.com/v0.1/checkouts",
                  {
                    headers: {
                      authorization: "Bearer " + body.access_token
                    },

                    json: {
                      checkout_reference: transaction_id,
                      amount: membershipCategory.value,
                      currency: "GBP",
                      pay_to_email: process.env.SUMUP_USERNAME,
                      description: "SHRUB Coop membership payment via website.",
                      return_url: "https://shrub.space/get-involved#membership"
                    }
                  },
                  function(error, response, body) {
                    if (!error) {
                      res.send({
                        status: "success",
                        checkout_reference: body.checkout_reference
                      });
                    } else {
                      res.send({
                        status: "fail",
                        msg: "Something went wrong creating checkout."
                      });
                    }
                  }
                );
              }
            }
          );
        }
      );
    } else {
      res.send({ status: "fail", msg: "No category." });
    }
  });
});

module.exports = router;
