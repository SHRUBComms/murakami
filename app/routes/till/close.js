// /till/close

var router = require("express").Router();

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");
var Tills = Models.Tills;
var TillActivity = Models.TillActivity;
var Transactions = Models.Transactions;
var StockCategories = Models.StockCategories;
var WorkingGroups = Models.WorkingGroups;

var Auth = require(rootDir + "/app/configs/auth");

router.get(
  "/:till_id",
  Auth.isLoggedIn,
  Auth.canAccessPage("tills", "close"),
  function(req, res) {
    Tills.getById(req.params.till_id, function(err, till) {
      if (till) {
        if (till.disabled == 0) {
          if (
            req.user.permissions.tills.close == true ||
            (req.user.permissions.tills.close == "commonWorkingGroup" &&
              req.user.working_groups.includes(till.group_id))
          ) {
            TillActivity.getByTillId(req.params.till_id, function(status) {
              if (status.opening == 1) {
                WorkingGroups.getAll(function(err, allWorkingGroups) {
                  var group = allWorkingGroups[till.group_id];

                  Transactions.getTotalCashTakingsSince(
                    till.till_id,
                    status.timestamp,
                    function(total_sales) {
                      total_sales = total_sales || 0;
                      res.render("till/close", {
                        tillMode: true,
                        closeTillActive: true,
                        title: "Close Till",
                        till: till,
                        status: status,
                        allWorkingGroups: allWorkingGroups,
                        working_group: group,
                        total_sales: total_sales.toFixed(2),
                        opening_float: status.counted_float.toFixed(2),
                        expected_float: (
                          +status.counted_float + +total_sales
                        ).toFixed(2)
                      });
                    }
                  );
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
            req.flash("error", "You don't have permission to close this till!");
            res.redirect(process.env.PUBLIC_ADDRESS + "/till/select");
          }
        } else {
          req.flash("error", "This till is disabled!");
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
  if (counted_float >= 0) {
    Tills.getById(req.params.till_id, function(err, till) {
      if (till) {
        if (till.disabled == 0) {
          TillActivity.getByTillId(req.params.till_id, function(status) {
            if (status.opening == "1") {
              Transactions.getTotalCashTakingsSince(
                till.till_id,
                status.timestamp,
                function(total_sales) {
                  try {
                    total_sales = parseFloat(total_sales);
                  } catch (err) {
                    total_sales = 0.0;
                  }

                  try {
                    status.counted_float = parseFloat(status.counted_float);
                  } catch (err) {
                    counted_float = 0.0;
                  }
                  TillActivity.close(
                    req.params.till_id,
                    +status.counted_float.toFixed(2) + +total_sales.toFixed(2),
                    counted_float,
                    req.user.id,
                    note,
                    function(err) {
                      if (err) {
                        req.flash("error", "Something went wrong!");
                        res.redirect(
                          process.env.PUBLIC_ADDRESS +
                            "/till/close/" +
                            req.params.till_id
                        );
                      } else {
                        req.flash("success_msg", "Till closed.");
                        res.redirect(
                          process.env.PUBLIC_ADDRESS +
                            "/till/open/" +
                            req.params.till_id
                        );
                      }
                    }
                  );
                }
              );
            } else {
              req.flash("error", "Till already closed!");
              res.redirect(process.env.PUBLIC_ADDRESS + "/till/select");
            }
          });
        } else {
          req.flash("error", "Till is disabled!");
          res.redirect(process.env.PUBLIC_ADDRESS + "/till/select");
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
