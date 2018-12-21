// /till

var router = require("express").Router();

var rootDir = process.env.CWD;

var Tills = require(rootDir + "/app/models/tills");
var WorkingGroups = require(rootDir + "/app/models/working-groups");

var Auth = require(rootDir + "/app/configs/auth");

router.get("/", Auth.isLoggedIn, function(req, res) {
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
        res.redirect("/till/" + tills[0].till_id);
      }
    });
  });
});

router.get("/:till_id", Auth.isLoggedIn, function(req, res) {
  Tills.getTillById(req.params.till_id, function(err, till) {
    if (till) {
      Tills.getStatusById(req.params.till_id, function(status) {
        if (status.opening == "1") {
          WorkingGroups.getAll(function(err, allWorkingGroups) {
            var group = allWorkingGroups[till.group_id];

            Tills.getCategoriesByTillId(req.params.till_id, "tree", function(
              err,
              categories
            ) {
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
            });
          });
        } else {
          res.redirect("/till/open/" + req.params.till_id);
        }
      });
    } else {
      res.redirect("/till");
    }
  });
});

router.use("/transaction", require("./transaction"));
router.use("/donations", require("./donations"));
router.use("/open", require("./open"));
router.use("/close", require("./close"));
router.use("/process-donation", require("./process-donation"));

module.exports = router;
