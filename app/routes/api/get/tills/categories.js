// /api/get/tills/categories

const router = require("express").Router();

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const StockCategories = Models.StockCategories;

const Auth = require(rootDir + "/app/configs/auth");

router.get("/:till_id", Auth.isLoggedIn, async (req, res) => {
  try {
    const categories = await StockCategories.getCategoriesByTillId(req.params.till_id, "tree");
    res.send(categories);
  } catch (error) {
    res.send({});
  }
});

module.exports = router;
