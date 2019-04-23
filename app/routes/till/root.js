// /till

var router = require("express").Router();
var async = require("async");

var rootDir = process.env.CWD;

var Tills = require(rootDir + "/app/models/tills");
var WorkingGroups = require(rootDir + "/app/models/working-groups");

var Auth = require(rootDir + "/app/configs/auth");

router.get(
  "/",
  Auth.isLoggedIn,
  Auth.canAccessPage("tills", "processTransaction"),
  function(req, res) {
    console.log("root");
    WorkingGroups.getAll(function(err, allWorkingGroups) {
      Tills.getAllTills(function(err, tills) {
        if (tills.length > 1) {
          res.render("till/root", {
            tillMode: true,
            title: "Select A Till",
            tills: tills,
            allWorkingGroups: allWorkingGroups
          });
        } else {
          res.redirect(
            process.env.PUBLIC_ADDRESS + "/till/" + tills[0].till_id
          );
        }
      });
    });
  }
);

router.get("/:till_id", Auth.isLoggedIn, function(req, res) {
  if (req.params.till_id == "manage" && req.user.permissions.tills.viewTill) {
    Tills.getAllTills(function(err, tills) {
      async.eachOf(
        tills,
        function(till, key, callback) {
          if (
            req.user.permissions.tills.viewTill == true ||
            (req.user.permissions.tills.viewTill == "commonWorkingGroup" &&
              req.user.working - groups.includes(till.group_id))
          ) {
            Tills.getStatusById(till.till_id, function(status) {
              till.status = status;
              callback();
            });
          } else {
            till[key] = {};
          }
        },
        function() {
          res.render("till/manage", {
            title: "Manage Tills",
            tillsActive: true,
            tills: tills
          });
        }
      );
    });
  } else if (
    req.params.till_id == "add" &&
    req.user.permissions.tills.addTill
  ) {
    res.render("till/add", {
      title: "Add Till",
      tillsActive: true
    });
  } else if (req.user.permissions.tills.processTransaction) {
    Tills.getTillById(req.params.till_id, function(err, till) {
      if (till) {
        if (
          req.user.permissions.tills.processTransaction == true ||
          (req.user.permissions.tills.processTransaction ==
            "commonWorkingGroup" &&
            req.user.working_groups.includes(till.group_id))
        ) {
          Tills.getStatusById(req.params.till_id, function(status) {
            if (status.opening == "1") {
              WorkingGroups.getAll(function(err, allWorkingGroups) {
                var group = allWorkingGroups[till.group_id];
                Tills.getCategoriesByTillId(
                  req.params.till_id,
                  "tree",
                  function(err, categories) {
                    res.render("till/root", {
                      tillMode: true,
                      title: "Transaction",
                      transactionsActive: true,
                      till: till,
                      allWorkingGroups: allWorkingGroups,
                      working_group: group,
                      categories: categories,
                      diode_api_key: process.env.DIODE_API_KEY,
                      sumup_affiliate_key: process.env.SUMUP_AFFILIATE_KEY,
                      sumup_app_id: process.env.SUMUP_APP_ID,
                      murakamiMsg: req.query.murakamiMsg || null,
                      murakamiStatus: req.query.murakamiStatus || null,
                      smpStatus: req.query["smp-status"] || null,
                      smpMsg: req.query["smp-failure-cause"] || null
                    });
                  }
                );
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
            "You don't have permission to process transactions on this till!"
          );
          res.redirect(process.env.PUBLIC_ADDRESS + "/till");
        }
      } else {
        res.redirect(process.env.PUBLIC_ADDRESS + "/till");
      }
    });
  }
});

router.use("/transaction", require("./transaction"));
router.use("/donations", require("./donations"));
router.use("/open", require("./open"));
router.use("/manage", require("./manage"));
router.use("/close", require("./close"));
router.use("/add", require("./add"));

module.exports = router;
