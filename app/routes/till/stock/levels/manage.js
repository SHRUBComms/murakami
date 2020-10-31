// /till/stock/levels/manage/

const router = require("express").Router();

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Tills = Models.Tills;
const TillActivity = Models.TillActivity;
const StockCategories = Models.StockCategories;

const Auth = require(rootDir + "/app/configs/auth");
const Helpers = require(rootDir + "/app/helper-functions/root");

router.get("/", Auth.isLoggedIn, Auth.canAccessPage("tills", "manageStock"), (req, res) => {
    req.flash("error", "Please select a till.");
    res.redirect(process.env.PUBLIC_ADDRESS + "/till/manage");
});

router.get("/:till_id", Auth.isLoggedIn, Auth.canAccessPage("tills", "manageStock"), async (req, res) => {
  try {
    let till = await Tills.getById(req.params.till_id);
    if (!till) {
      throw "Till not found";
    }
    
    if (!(req.user.permissions.tills.manageStock == true || (req.user.permissions.tills.manageStock == "commonWorkingGroup" && req.user.working_groups.includes(till.group_id)))) {
      throw "You don't have permission to manage stock on this till";
    }
    
    const status = await TillActivity.getByTillId(till.till_id);
    till.status = status.opening;

    const categories = await StockCategories.getCategoriesByTillId(req.params.till_id, "tree");
    const flatCategories = await Helpers.flatten(categories);
 
    res.render("till/stock/levels/manage", {
      tillMode: true,
      title: "Manage Stock Levels",
      tillDashboardActive: true,
      till: till,
      status: status,
      categories: categories,
      flatCategories: flatCategories
    });  
  } catch (error) {
    
    if(typeof error != "string") {
      error = "Something went wrong! Please try again";
    }

    req.flash("error_msg", error);
    res.redirect(process.env.PUBLIC_ADDRESS + "/till/manage");
  }
});

module.exports = router;
