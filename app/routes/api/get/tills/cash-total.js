// /api/get/tills/cash-total

const router = require("express").Router();

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Tills = Models.Tills;
const Transactions = Models.Transactions;

const Auth = require(rootDir + "/app/controllers/auth");

router.get("/:till_id", Auth.isLoggedIn, Auth.canAccessPage("tills", "close"), async (req, res) => {
  try {
    const till = await Tills.getOpenTill(req.params.till_id);
    
    if (!(req.user.permissions.tills.close == true || (req.user.permissions.tills.close == "commonWorkingGroup" && req.user.working_groups.includes(till.group_id)))) {
      throw "You don't have permission";
    }
    
    const { totalTakings, totalRefunds, totalReimbursements } = await Transactions.getTotalCashTakingsSince(till.till_id, till.openingTimestamp);
    
    const cashTotal = ((Number(till.openingFloat) + (Number(totalTakings) || 0)) - (Number(totalRefunds) || 0) - (Number(totalReimbursements || 0))).toFixed(2);
    res.send({ status: "ok", cashTotal });
  } catch (error) {
    if(typeof error != "string") {
      error = "Something went wrong! Please try again";
    }
    
    res.send({ status: "fail", msg: error });
  }
});
module.exports = router;
