// /api/post/tills/categories/update
const router = require("express").Router();

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Tills = Models.Tills;
const StockCategories = Models.StockCategories;
const CarbonCategories = Models.CarbonCategories;

const Auth = require(rootDir + "/app/configs/auth");
const validateCategory = require(rootDir + "/app/controllers/tills/categories/validateCategory");

router.post("/", Auth.isLoggedIn, Auth.canAccessPage("tills", "updateCategories"), async (req, res) => {
  try {
    let category = req.body.category;
    
    if (!category) {
      throw "Please enter a category to update";
    }

    const till = await Tills.getById(category.till_id);

    if (!till) {
      throw "Till not found!";
    }
    
    if (till.disabled == 1) {
      throw "Till is disabled!";
    }
     
    if (!(req.user.permissions.tills.updateCategories == true || (req.user.permissions.tills.updateCategories == "commonWorkingGroup" && req.user.working_groups.includes(till.group_id)))) {
      throw "You don't have permission to update categories on this till";
    }

    category.weight = category.weight == 0 ? null : category.weight;

    const categories = await StockCategories.getAllCategories();

    if (!categories[category.item_id]) {
      throw "Category not found";
    }

    const carbonCategories = await CarbonCategories.getAll();

    await validateCategory(category, categories, carbonCategories);

    let sanitizedCategory = {};
    sanitizedCategory.item_id = category.item_id;
    sanitizedCategory.name = category.name;
    sanitizedCategory.till_id = category.till_id;
    sanitizedCategory.carbon_id = category.carbon_id || null;
    sanitizedCategory.parent = category.parent || null;
    sanitizedCategory.value = category.value || null;
    sanitizedCategory.allowTokens = category.allowTokens;
    sanitizedCategory.member_discount = category.member_discount;
    sanitizedCategory.stockControl = category.stockControl;
    sanitizedCategory.conditions = category.conditions;
    sanitizedCategory.stockInfo = {};

    if (sanitizedCategory.stockControl == 1) {
      for await (const condition of sanitizedCategory.conditions) {
        sanitizedCategory.stockInfo[condition] = { quantity: 0 };
      }
    }

    await StockCategories.updateCategory(sanitizedCategory);
    
    res.send({ status: "ok", msg: "Category updated!" });
  } catch (error) {
    if(typeof error != "string") {
      error = "Something went wrong! Please try again";
    }

    res.send({ status: "fail", msg: error });
  }
});
module.exports = router;
