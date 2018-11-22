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
          title: "Tills",
          layout: "login-layout",
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
              console.log(categories[0].children[0]);
              res.render("till/root", {
                title: till.name + " - " + group.name,
                layout: "till",
                transactionsActive: true,
                till: till,
                allWorkingGroups: allWorkingGroups,
                working_group: group,
                categories: categories
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
