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
            Members.getById(member_id, function(err, member) {
              if (member[0]) {
                member = member[0];
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

                    Tills.addTransaction(formattedTransaction, function(err) {
                      Mail.sendGeneral(
                        member.first_name +
                          " " +
                          member.last_name +
                          " <" +
                          member.email +
                          ">",
                        "Your Recent Donation",
                        "<p>Hey " +
                          member.first_name +
                          "!</p>" +
                          "<p>Your recent donation has been processed and <b>" +
                          tokens +
                          " tokens</b> have been credited to your account, leaving you with a total of " +
                          (+member.balance + +tokens) +
                          " tokens which you can spend in <a href='https://goo.gl/maps/L5WCe6ji1Xr'>our swapshop</a>.</p>" +
                          "<p>Thanks so much for your donation, we hope to see you soon!</p>" +
                          "<p>Shrub Co-op</p>",
                        function(err) {
                          if (err) {
                            response.msg =
                              "Tokens added but something went wrong notifying the member!";
                          } else {
                            response.status = "ok";
                            response.msg = "Tokens added and member notified!";
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
