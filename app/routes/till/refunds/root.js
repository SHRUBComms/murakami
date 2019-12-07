// /till/refunds

var router = require("express").Router();
var moment = require("moment");
moment.locale("en-gb");

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");
var Tills = Models.Tills;
var TillActivity = Models.TillActivity;
var Transactions = Models.Transactions;
var Settings = Models.Settings;

var Auth = require(rootDir + "/app/configs/auth");
var Mail = require(rootDir + "/app/configs/mail/root");

router.use("/issue", require("./issue"));

router.get(
  "/:till_id",
  Auth.isLoggedIn,
  Auth.canAccessPage("tills", "processRefunds"),
  function(req, res) {
    Tills.getById(req.params.till_id, function(err, till) {
      if (till) {
        if (
          req.user.permissions.tills.processRefunds == true ||
          (req.user.permissions.tills.processRefunds == "commonWorkingGroup" &&
            req.user.working_groups.includes(till.group_id))
        ) {
          TillActivity.getByTillId(req.params.till_id, function(status) {
            if (status.opening) {
              Settings.getStaticContent(function(err, staticContent) {
                res.render("till/refunds", {
                  tillMode: true,
                  title: "Process Refund",
                  refundsActive: true,
                  refundPolicy: staticContent.texts.refundPolicy,
                  till: till
                });
              });
            } else {
              res.redirect(
                process.env.PUBLIC_ADDRESS + "/till/open/" + req.params.till_id
              );
            }
          });
        } else {
          req.flash(
            "error",
            "You don't have permission to process refunds on this till!"
          );
          res.redirect(process.env.PUBLIC_ADDRESS + "/till");
        }
      } else {
        res.redirect(process.env.PUBLIC_ADDRESS + "/till");
      }
    });
  }
);



module.exports = router;
