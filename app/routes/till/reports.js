// /till/report

const router = require("express").Router();

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Tills = Models.Tills;
const TillActivity = Models.TillActivity;

const Auth = require(rootDir + "/app/configs/auth");

router.get("/", Auth.isLoggedIn, Auth.canAccessPage("tills", "viewReports"), (req, res) => {
  res.redirect(process.env.PUBLIC_ADDRESS + "/");
});

router.get("/:till_id", Auth.isLoggedIn, Auth.canAccessPage("tills", "viewReports"), async (req, res) => {
  try {
    let till = await Tills.getById(req.params.till_id);
    if (!till) {
      throw "Till not found";
    }
    
    const status = await TillActivity.getByTillId(till.till_id);
    till.status = status.opening;
    res.render("till/reports", {
      title: "Till Reports",
      tillActive: true,
      tillDashboardActive: true,
      tillMode: true,
      till: till,
      status: status
    });
  } catch (error) {
    res.redirect(process.env.PUBLIC_ADDRESS + "/till/manage");
  }
});

module.exports = router;
