// /api/get/tills/cash-total

var router = require("express").Router();

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");

var Tills = Models.Tills;
var Transactions = Models.Transactions;
var TillActivity = Models.TillActivity;

var Auth = require(rootDir + "/app/configs/auth");

router.get(
  "/:till_id",
  Auth.isLoggedIn,
  Auth.canAccessPage("tills", "close"),
  function(req, res) {
    var response = { status: "fail" };
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
                Transactions.getTotalCashTakingsSince(
                  till.till_id,
                  status.timestamp,
                  function(total_sales, total_refunds) {
                    response.status = "ok";
                    total_sales = Number(total_sales) || 0;
                    total_refunds = Number(total_refunds) || 0;
                    response.cashTotal = (
                      Number(status.counted_float) + Number(total_sales) - Number(total_refunds)
                    ).toFixed(2);
                    res.send(response);
                  }
                );
              } else {
                response.msg = "Till closed.";
                res.send(response);
              }
            });
          } else {
            response.msg = "Insufficient permissions.";
            res.send(response);
          }
        } else {
          response.msg = "Till is disabled.";
          res.send(response);
        }
      } else {
        response.msg = "Till doesn't exist.";
        res.send(response);
      }
    });
  }
);

module.exports = router;
