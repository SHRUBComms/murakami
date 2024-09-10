// /api/post/tills/categories/discounts/add
const router = require("express").Router();

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Tills = Models.Tills;
const StockCategories = Models.StockCategories;

const Auth = require(rootDir + "/app/controllers/auth");
const validateDiscount = require(rootDir + "/app/controllers/tills/categories/validateDiscount");

router.post(
  "/",
  Auth.isLoggedIn,
  Auth.canAccessPage("tills", "updateCategories"),
  async (req, res) => {
    try {
      const discount = req.body.discount;

      if (!discount) {
        throw "Please enter a discount to add";
      }

      const till = await Tills.getById(discount.till_id);

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
        throw "You don't have permission to add discounts on this till";
      }

      const categories = await StockCategories.getAllCategories();

      await validateDiscount(discount, categories);

      const sanitizedCategory = {};
      sanitizedCategory.name = discount.name;
      sanitizedCategory.discount = discount.discount_type;
      sanitizedCategory.till_id = null;
      sanitizedCategory.carbon_id = null;
      sanitizedCategory.parent = discount.parent || null;
      sanitizedCategory.value = discount.value;
      sanitizedCategory.allowTokens = false;
      sanitizedCategory.member_discount = 0;
      sanitizedCategory.stockControl = false;
      sanitizedCategory.conditions = [];
      sanitizedCategory.stockInfo = {};

      const categoryId = await StockCategories.addCategory(sanitizedCategory);

      res.send({ status: "ok", msg: "Discount added!", newId: categoryId });
    } catch (error) {
      console.log(error);
      let errorMessage = error;
      if (typeof error != "string") {
        errorMessage = "Something went wrong! Please try again";
      }

      res.send({ status: "fail", msg: errorMessage });
    }
  }
);

module.exports = router;
