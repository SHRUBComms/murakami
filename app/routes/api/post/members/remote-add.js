// /api/post/members/remote-add

var router = require("express").Router();
var async = require("async");
var request = require("request");

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");
var Members = Models.Members;
var Transactions = Models.Transactions;

var Auth = require(rootDir + "/app/configs/auth");

router.post("/", Auth.verifyByKey("membershipSignUp"), function(req, res) {
  var membershipCost = 1.0;

  req.checkBody("dob", "Please enter a date of birth").notEmpty();

  req.checkBody("first_name", "Please enter a first name").notEmpty();
  req
    .checkBody(
      "first_name",
      "Please enter a shorter first name (<= 20 characters)"
    )
    .isLength({ max: 20 });

  req.checkBody("last_name", "Please enter a last name").notEmpty();
  req
    .checkBody(
      "last_name",
      "Please enter a shorter last name (<= 30 characters)"
    )
    .isLength({ max: 30 });

  req.checkBody("email", "Please enter an email address").notEmpty();
  req
    .checkBody(
      "email",
      "Please enter a shorter email address (<= 89 characters)"
    )
    .isLength({ max: 89 });
  req.checkBody("email", "Please enter a valid email address").isEmail();

  req.checkBody("address", "Please enter an address").notEmpty();

  req
    .checkBody(
      "our_vision_check",
      "Please confirm that you understand SHRUB's vision"
    )
    .notEmpty();
  req
    .checkBody(
      "safer_spaces_check",
      "Please confirm that you agree to our Safer Spaces policy"
    )
    .notEmpty();

  req
    .checkBody(
      "membership_benefits_check",
      "Please confirm you have explained membership benefits"
    )
    .notEmpty();

  req
    .checkBody(
      "contact_consent_check",
      "Please confirm the prospective member has consented to being contacted by email"
    )
    .notEmpty();
  req
    .checkBody(
      "privacy_notice_check",
      "Please confirm the prospective member has agreed to our privacy policy"
    )
    .notEmpty();

  if (req.body.phone_no) {
    req
      .checkBody("phone_no", "Please enter a shorter phone number (<= 30)")
      .isLength({ max: 30 });
  }

  var dob = new Date(req.body.dob);
  var today = new Date();

  var over16 = (today - dob) / (1000 * 3600 * 24 * 365) >= 16;

  var errors = req.validationErrors();

  if (!errors && !over16) {
    if (!errors) {
      errors = [];
    }
    errors.push({
      param: "dob",
      msg: "Must be over 16 to be a member",
      value: req.body.dob
    });
  }

  if (!errors) {
    var newMember = {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      address: req.body.address,
      phone_no: req.body.phone_no,
      free: 0,
      membership_type: "unpaid",
      earliest_membership_date: today,
      current_init_membership: today,
      current_exp_membership: today
    };

    Members.add(newMember, function(err, member_id) {
      if (!err && member_id) {
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

              Transactions.addTransaction(
                {
                  till_id: "website",
                  user_id: "website",
                  member_id: member_id,
                  date: new Date(),
                  summary: {
                    sumupCheckoutId: "",
                    bill: [
                      {
                        value: membershipCost,
                        item_id: "membership"
                      }
                    ],
                    totals: { money: membershipCost },
                    comment: "1 year of membership. Processed through website."
                  }
                },
                function(err, transaction_id) {
                  if (!err) {
                    request.post(
                      "https://api.sumup.com/v0.1/checkouts",
                      {
                        headers: {
                          authorization: "Bearer " + body.access_token
                        },

                        json: {
                          checkout_reference: transaction_id,
                          amount: membershipCost,
                          currency: "GBP",
                          pay_to_email: process.env.SUMUP_USERNAME,
                          description:
                            "1 year of SHRUB Coop membership, via website.",
                          return_url:
                            "https://shrub.space/get-involved#membership"
                        }
                      },
                      function(error, response, body) {
                        if (!error) {
                          Transactions.update({summary: {sumupCheckoutId: body.id}}, {where: {transaction_id: transaction_id}}).nodeify(function(err){
                            if(!err){
                              res.send({
                                status: "ok",
                                checkoutId: body.id,
                                murakamiTransactionId: transaction_id
                              });
                            } else {
                              res.send({
                                status: "fail",
                                msg:
                                  "Something went wrong! You have not been charged."
                              });
                            }
                          })

                        } else {
                          res.send({
                            status: "fail",
                            msg:
                              "Something went wrong! You have not been charged."
                          });
                        }
                      }
                    );
                  } else {
                    res.send({
                      status: "fail",
                      msg: "Something went wrong! You have not been charged."
                    });
                  }
                }
              );
            }
          }
        );
      } else {
        res.send({
          status: "fail",
          msg: "Something went wrong creating your! You have not been charged."
        });
      }
    });
  } else {
    res.send({
      status: "fail",
      msg: "Something went wrong! You have not been charged."
    });
  }
});

router.post("/verify-payment", Auth.verifyByKey("membershipSignUp"), function(
  req,
  res
) {
  var transaction_id = req.body.murakami_transation_id;
  var sumup_transaction_id = req.body.sumup_transaction_id;

  // Check sumup.

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
        request.get(
          "https://api.sumup.com/v0.1/me/transactions?id=" +
            sumup_transaction_id,
          {
            headers: {
              authorization: "Bearer " + body.access_token
            }
          },
          (error, response, body) => {
            if (error || response.statusCode != 200) {
            } else {
              if (body.status == "PAID") {
                Transactions.find({
                  where: { transaction_id: murakami_transation_id }
                }).nodeify(function(err, transaction) {
                  if (!err && transaction) {
                    if (
                      transaction.summary.sumupCheckoutId ==
                      sumup_transaction_id
                    ) {
                      res.send({
                        status: "ok"
                      });
                    } else {
                      res.send({
                        status: "fail",
                        msg:
                          "Something went wrong verifying your payment! You may have been charged."
                      });
                    }
                  } else {
                    res.send({
                      status: "fail",
                      msg:
                        "Something went wrong verifying your payment! You may have been charged."
                    });
                  }
                });
              } else {
                res.send({
                  status: "fail",
                  msg:
                    "Something went wrong verifying your payment! You may have been charged."
                });
              }
            }
          }
        );
      }
    }
  );
});

module.exports = router;
