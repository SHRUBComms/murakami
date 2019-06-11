// /till/open

var router = require("express").Router();

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");
var Tills = Models.Tills;
var TillActivity = Models.TillActivity;
var WorkingGroups = Models.WorkingGroups;

var Auth = require(rootDir + "/app/configs/auth");

router.get(
  "/:till_id",
  Auth.isLoggedIn,
  Auth.canAccessPage("tills", "open"),
  function(req, res) {
    Tills.getById(req.params.till_id, function(err, till) {
      if (till) {
        if (till.disabled) {
          if (
            req.user.permissions.tills.open == true ||
            (req.user.permissions.tills.open == "commonWorkingGroup" &&
              req.user.working_groups.includes(till.group_id))
          ) {
            TillActivity.getByTillId(req.params.till_id, function(status) {
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
                res.redirect(
                  process.env.PUBLIC_ADDRESS +
                    "/till/transaction/" +
                    req.params.till_id
                );
              }
            });
          } else {
            req.flash("error", "You don't have permission to open this till!");
            res.redirect(process.env.PUBLIC_ADDRESS + "/till/select");
          }
        } else {
          req.flash("error", "Till is disabled!");
          res.redirect(process.env.PUBLIC_ADDRESS + "/till/select");
        }
      } else {
        res.redirect(process.env.PUBLIC_ADDRESS + "/till/select");
      }
    });
  }
);

router.post("/:till_id", Auth.isLoggedIn, function(req, res) {
  var counted_float = req.body.counted_float;
  var note = req.body.note;

  if (counted_float > 0) {
    Tills.getById(req.params.till_id, function(err, till) {
      if (till) {
        if (till.disabled == 0) {
          TillActivity.getByTillId(req.params.till_id, function(status) {
            if (status.opening == "0") {
              TillActivity.open(
                req.params.till_id,
                counted_float,
                req.user.id,
                note,
                function(err) {
                  if (err) {
                    req.flash("error", "Something went wrong!");
                    res.redirect(
                      process.env.PUBLIC_ADDRESS +
                        "/till/open/" +
                        req.params.till_id
                    );
                  } else {
                    res.redirect(
                      process.env.PUBLIC_ADDRESS +
                        "/till/transaction/" +
                        req.params.till_id
                    );
                  }
                }
              );
            } else {
              req.flash("error", "Till already open!");
              res.redirect(
                process.env.PUBLIC_ADDRESS +
                  "/till/transaction/" +
                  req.params.till_id
              );
            }
          });
        } else {
          req.flash("error", "Till is disabled!");
          res.redirect(process.env.PUBLIC_ADDRESS + "/till/select/");
        }
      } else {
        res.redirect(process.env.PUBLIC_ADDRESS + "/till/select");
      }
    });
  } else {
    req.flash("error", "Enter a valid opening float.");
    res.redirect(
      process.env.PUBLIC_ADDRESS + "/till/open/" + req.params.till_id
    );
  }
});

module.exports = router;
