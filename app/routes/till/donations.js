// /till/donations

var router = require("express").Router();

var rootDir = process.env.CWD;

var Tills = require(rootDir + "/app/models/tills");
var Members = require(rootDir + "/app/models/members");

var Auth = require(rootDir + "/app/configs/auth");
var Mail = require(rootDir + "/app/configs/mail");

router.get("/:till_id", Auth.isLoggedIn, function(req, res) {
  Tills.getTillById(req.params.till_id, function(err, till) {
    if (till) {
      Tills.getStatusById(req.params.till_id, function(status) {
        if (status.opening) {
          res.render("till/donations", {
            tillMode: true,
            title: "Process Donation",
            donationsActive: true,
            till: till
          });
        } else {
          res.redirect(process.env.PUBLIC_ADDRESS + "/till/open/" + req.params.till_id);
        }
      });
    } else {
      res.redirect(process.env.PUBLIC_ADDRESS + "/till");
    }
  });
});

router.post("/", Auth.isLoggedIn, function(req, res){
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
                    member.tokens = tokens;
                    member.name = member.first_name + " " + member.last_name;
                    member.membership_expires = member.current_exp_membership;
                    Tills.addTransaction(formattedTransaction, function(err) {
                      if (member.contactPreferences.donations) {
                        Mail.sendDonation(
                          member,

                          function(err) {
                            if (err) {
                              response.msg =
                                "Tokens added but something went wrong notifying the member!";
                            } else {
                              response.status = "ok";
                              response.msg =
                                "Tokens added and member notified!";
                              response.member = {
                                id: member.member_id,
                                name: member.name,
                                balance: member.balance,
                                is_member: 1,
                                membership_expires: member.membership_expires
                              };
                              res.send(response);
                            }
                          }
                        );
                      } else {
                        response.status = "ok";
                        response.msg =
                          "Tokens added! Member has asked not to be notified by email.";
                        response.member = {
                          id: member.member_id,
                          name: member.name,
                          balance: member.balance,
                          is_member: 1,
                          membership_expires: member.membership_expires
                        };
                        res.send(response);
                      }
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
})

module.exports = router;
