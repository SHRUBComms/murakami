// /till/close

var router = require("express").Router();

var rootDir = process.env.CWD;

var Tills = require(rootDir + "/app/models/tills");
var WorkingGroups = require(rootDir + "/app/models/working-groups");

var Auth = require(rootDir + "/app/configs/auth");

router.get("/:till_id", Auth.isLoggedIn, function(req, res) {
  Tills.getTillById(req.params.till_id, function(err, till) {
    if (till) {
      Tills.getStatusById(req.params.till_id, function(status) {
        if (status.opening == 1) {
          WorkingGroups.getAll(function(err, allWorkingGroups) {
            var group = allWorkingGroups[till.group_id];

            Tills.getTotalCashTakingsSince(
              till.till_id,
              status.timestamp,
              function(total_sales) {
                total_sales = total_sales || 0;
                res.render("till/close", {
                  title: "Close " + till.name + " - " + group.name,
                  layout: "login-layout",
                  till: till,
                  allWorkingGroups: allWorkingGroups,
                  working_group: group,
                  expected_float: (
                    +status.counted_float + +total_sales
                  ).toFixed(2)
                });
              }
            );
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

  if (counted_float >= 0) {
    Tills.getTillById(req.params.till_id, function(err, till) {
      if (till) {
        Tills.getStatusById(req.params.till_id, function(status) {
          if (status.opening == "1") {
            Tills.getTotalCashTakingsSince(
              till.till_id,
              status.timestamp,
              function(total_sales) {
                Tills.close(
                  req.params.till_id,
                  +status.counted_float.toFixed(2) + +total_sales.toFixed(2),
                  counted_float,
                  req.user.id,
                  function(err) {
                    if (err) {
                      req.flash("error", "Something went wrong!");
                      res.redirect("/till/close/" + req.params.till_id);
                    } else {
                      req.flash(
                        "success_msg",
                        "Till closed. <a href='/logout'>Logout</a>"
                      );
                      res.redirect("/till");
                    }
                  }
                );
              }
            );
          } else {
            req.flash("error", "Till already closed!");
            res.redirect("/till");
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
