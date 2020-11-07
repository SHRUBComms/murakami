// /till/refunds

const router = require("express").Router();
const moment = require("moment");
moment.locale("en-gb");

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Tills = Models.Tills;
const Settings = Models.Settings;

const Auth = require(rootDir + "/app/controllers/auth");

router.use("/issue", require("./issue"));

router.get("/:till_id", Auth.isLoggedIn, Auth.canAccessPage("tills", "processRefunds"), async (req, res) => {
  try {
    const till = await Tills.getOpenTill(req.params.till_id);

    if (!(req.user.permissions.tills.processRefunds == true || (req.user.permissions.tills.processRefunds == "commonWorkingGroup" && req.user.working_groups.includes(till.group_id)))) {
      throw "You don't have permission to process donations on this till";
    }
      
    const staticContent = await Settings.getStaticContent();

    res.render("till/refunds", {
      tillMode: true,
      title: "Process Refund",
      refundsActive: true,
      refundPolicy: staticContent.texts.refundPolicy,
      till: till
    });
  } catch (error) {
    if(typeof error != "string") {
      error = "Something went wrong! Please try again";
    }
    req.flash("error_msg", error);
    res.redirect(process.env.PUBLIC_ADDRESS + "/till/dashboard/" + req.params.till_id);
  }
});


module.exports = router;
