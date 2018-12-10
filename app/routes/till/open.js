// /till/open

var router = require("express").Router();

var rootDir = process.env.CWD;

var Tills = require(rootDir + "/app/models/tills");
var WorkingGroups = require(rootDir + "/app/models/working-groups");

var Auth = require(rootDir + "/app/configs/auth");

router.get("/:till_id", Auth.isLoggedIn, function(req, res) {
  Tills.getTillById(req.params.till_id, function(err, till) {
    if (till) {
      Tills.getStatusById(req.params.till_id, function(status) {
        if (status.opening == 0) {
          WorkingGroups.getAll(function(err, allWorkingGroups) {
            var group = allWorkingGroups[till.group_id];
            res.render("till/open", {
              tillMode: true,
              openTillActive: true,
              title: "Open Till",
              till: till,
              allWorkingGroups: allWorkingGroups,
              working_group: group
            });
          });
        } else {
          res.redirect("/till/" + req.params.till_id);
        }
      });
    } else {
      res.redirect("/till");
    }
  });
});

router.post("/:till_id", Auth.isLoggedIn, function(req, res) {
  var counted_float = req.body.counted_float;
  var note = req.body.note;

  if (counted_float > 0) {
    Tills.getTillById(req.params.till_id, function(err, till) {
      if (till) {
        Tills.getStatusById(req.params.till_id, function(status) {
          if (status.opening == "0") {
            Tills.open(
              req.params.till_id,
              counted_float,
              req.user.id,
              note,
              function(err) {
                if (err) {
                  req.flash("error", "Something went wrong!");
                  res.redirect("/till/open/" + req.params.till_id);
                } else {
                  res.redirect("/till/" + req.params.till_id);
                }
              }
            );
          } else {
            req.flash("error", "Till already open!");
            res.redirect("/till/" + req.params.till_id);
          }
        });
      } else {
        res.redirect("/till");
      }
    });
  } else {
    req.flash("error", "Enter a valid opening float.");
    res.redirect("/till/open/" + req.params.till_id);
  }
});

module.exports = router;
