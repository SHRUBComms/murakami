// /till/close

const router = require("express").Router();

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Tills = Models.Tills;
const TillActivity = Models.TillActivity;
const Transactions = Models.Transactions;
const StockCategories = Models.StockCategories;
const WorkingGroups = Models.WorkingGroups;

const Auth = require(rootDir + "/app/controllers/auth");
const validateFloat = require(rootDir + "/app/controllers/tills/activity/validateFloat");

router.get("/:till_id", Auth.isLoggedIn, Auth.canAccessPage("tills", "close"), async (req, res) => {
  try {
    const till = await Tills.getOpenTill(req.params.till_id);

    if (
      !(
        req.user.permissions.tills.close == true ||
        (req.user.permissions.tills.close == "commonWorkingGroup" &&
          req.user.working_groups.includes(till.group_id))
      )
    ) {
      throw "You are not permitted to close this till";
    }

    const group = req.user.allWorkingGroups[till.group_id];

    const { totalTakings, totalRefunds, totalReimbursements } =
      await Transactions.getTotalCashTakingsSince(till.till_id, till.openingTimestamp);

    res.render("till/close", {
      tillMode: true,
      closeTillActive: true,
      title: "Close Till",
      till: till,
      allWorkingGroups: req.user.allWorkingGroups,
      working_group: group,
      refunds_total: Number(totalRefunds).toFixed(2),
      revenue_total: Number(totalTakings).toFixed(2),
      reimbursements_total: Number(totalReimbursements).toFixed(2),
      opening_float: Number(till.openingFloat).toFixed(2),
      expected_float: (
        Number(till.openingFloat) +
        Number(totalTakings) -
        Number(totalRefunds) -
        Number(totalReimbursements)
      ).toFixed(2),
    });
  } catch (error) {
    console.log(error);
    res.redirect(process.env.PUBLIC_ADDRESS + "/till/dashboard/" + req.params.till_id);
  }
});

router.post(
  "/:till_id",
  Auth.isLoggedIn,
  Auth.canAccessPage("tills", "close"),
  async (req, res) => {
    try {
      await validateFloat(req.body);
      const till = await Tills.getOpenTill(req.params.till_id);
      const { totalTakings, totalRefunds, totalReimbursements } =
        await Transactions.getTotalCashTakingsSince(req.params.till_id, till.openingTimestamp);

      const expected_float = Number(
        Number(till.openingFloat) +
          Number(totalTakings) -
          Number(totalRefunds) -
          Number(totalReimbursements)
      );

      await TillActivity.close(
        req.params.till_id,
        expected_float,
        req.body.counted_float,
        req.user.id,
        req.body.note
      );

      req.flash("success_msg", "Till closed!");
      res.redirect(process.env.PUBLIC_ADDRESS + "/till/dashboard/" + req.params.till_id);
    } catch (error) {
      console.log(error);
      if (typeof error != "string") {
        error = "Something went wrong! Please try again";
      }

      req.flash("error_msg", error);
      res.redirect(process.env.PUBLIC_ADDRESS + "/till/close/" + req.params.till_id);
    }
  }
);

module.exports = router;
