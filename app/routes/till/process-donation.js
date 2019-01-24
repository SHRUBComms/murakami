// /till/process-donation

var router = require("express").Router();

var rootDir = process.env.CWD;

var Tills = require(rootDir + "/app/models/tills");
var Members = require(rootDir + "/app/models/members");

var Auth = require(rootDir + "/app/configs/auth");
var Mail = require(rootDir + "/app/configs/mail");

router.post("/", Auth.isLoggedIn, function(req, res) {
  var member_id = req.body.member_id;
  var till_id = req.body.till_id;
  var tokens = req.body.tokens;
  var response = { status: "fail" };

  Tills.getTillById(till_id, function(err, till) {
    if (till && !err) {
      Tills.getStatusById(till_id, function(status) {
        if (status.opening == 1) {
          if (tokens > 0 && tokens <= 50 && tokens % 1 == 0) {
            Members.getById(member_id, { class: "admin" }, function(
              err,
              member
            ) {
              if (member) {
                Members.updateBalance(
                  member_id,
                  +member.balance + +tokens,
                  function() {
                    var formattedTransaction = {
                      till_id: till_id,
                      user_id: req.user.id,
                      member_id: member_id,
                      date: new Date(),
                      summary: {
                        totals: { tokens: tokens },
                        bill: [{ item_id: "donation", tokens: tokens }]
                      }
                    };

                    formattedTransaction.summary = JSON.stringify(
                      formattedTransaction.summary
                    );
                    member.balance = +member.balance + +tokens;
                    member.name = member.first_name + " " + member.last_name;
                    member.membership_expires = member.current_exp_membership;
                    Tills.addTransaction(formattedTransaction, function(err) {
                      Mail.sendGeneral(
                        member.first_name +
                          " " +
                          member.last_name +
                          " <" +
                          member.email +
                          ">",
                        "Swap Shop: New tokens have been added to your account!",
                        "<p>Hi " +
                          member.first_name +
                          ",</p>" +
                          "<p>Our volunteers have processed the items you recently dropped off at the Swap Shop and <b>" +
                          tokens +
                          " tokens</b> have been added to your account</p>" +
                          "<p>You now have a total of " +
                          member.balance +
                          " tokens in your account.</p>" +

                          "<p><b>How do we value your stuff?</b></p>" +
                          "<p>Our volunteers sort through your items to check their condition and value the items we're able to sell in the shop.</p>" +

                          "<p>Unlike your ordinary charity shop, we give you back 25% of your item's value. This is added to your account in the form of tokens that you can spend at the Swap Shop where 1 token is worth £1.</p>" +

                          "<p>We're open 12pm to 5pm, Wednesday, Thursday, Friday, Saturday.</p>" +

                          "<p>Thank you!</p>" +

                          "<p>The Swap Shop</p>",

                        function(err) {
                          if (err) {
                            response.msg =
                              "Tokens added but something went wrong notifying the member!";
                          } else {
                            response.status = "ok";
                            response.msg = "Tokens added and member notified!";
                            response.member = member;
                            res.send(response);
                          }
                        }
                      );
                    });
                  }
                );
              } else {
                response.msg = "Member not found.";
                res.send(response);
              }
            });
          } else {
            response.msg = "Please enter a valid number of tokens.";
            res.send(response);
          }
        } else {
          response.msg = "Till closed!";
          res.send(response);
        }
      });
    } else {
      response.msg = "Till not found!";
      res.send(response);
    }
  });
});

module.exports = router;
