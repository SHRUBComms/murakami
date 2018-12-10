// /till/donations

var router = require("express").Router();

var rootDir = process.env.CWD;

var Tills = require(rootDir + "/app/models/tills");

var Auth = require(rootDir + "/app/configs/auth");

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
          res.redirect("/till/open/" + req.params.till_id);
        }
      });
    } else {
      res.redirect("/till");
    }
  });
});

module.exports = router;
