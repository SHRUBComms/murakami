// /api/post/tills/categories/add
const router = require("express").Router();

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Tills = Models.Tills;
const StockCategories = Models.StockCategories;
const CarbonCategories = Models.CarbonCategories;

const Auth = require(rootDir + "/app/controllers/auth");
const validateCategory = require(rootDir + "/app/controllers/tills/categories/validateCategory");

router.post(
  "/",
  Auth.isLoggedIn,
  Auth.canAccessPage("tills", "updateCategories"),
  async (req, res) => {
    try {
      const category = req.body.category;
      console.log(category);
      if (!category) {
        throw "Please enter a category to add";
      }

      const till = await Tills.getById(category.till_id);

      if (!till) {
        throw "Till not found!";
      }

      if (till.disabled == 1) {
        throw "Till is disabled!";
      }

      if (
        !(
          req.user.permissions.tills.updateCategories == true ||
          (req.user.permissions.tills.updateCategories == "commonWorkingGroup" &&
            req.user.working_groups.includes(till.group_id))
        )
      ) {
        throw "You don't have permission to add categories on this till";
      }

      category.weight = category.weight == 0 ? null : category.weight;

      const categories = await StockCategories.getAllCategories();
      const carbonCategories = await CarbonCategories.getAll();

      await validateCategory(category, categories, carbonCategories);

      const sanitizedCategory = {};
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

      if (category.group_id) {
        if (req.user.allWorkingGroupsObj[category.group_id]) {
          sanitizedCategory.group_id = category.group_id;
        }
      }

      if (sanitizedCategory.stockControl == 1) {
        for await (const condition of sanitizedCategory.conditions) {
          sanitizedCategory.stockInfo[condition] = { quantity: 0 };
        }
      }

      const categoryId = await StockCategories.addCategory(sanitizedCategory);

      res.send({ status: "ok", msg: "Category added!", newId: categoryId });
    } catch (error) {
      console.log(error);
      if (typeof error != "string") {
        error = "Something went wrong! Please try again";
      }

      res.send({ status: "fail", msg: error });
    }
  }
);
module.exports = router;
