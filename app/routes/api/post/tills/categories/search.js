// /api/post/tills/categories/search

const router = require("express").Router();

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const StockCategories = Models.StockCategories;

const Auth = require(rootDir + "/app/controllers/auth");
const Helpers = require(rootDir + "/app/controllers/helper-functions/root");

router.post("/", Auth.isLoggedIn, Auth.canAccessPage("tills", "viewTill"), async (req, res) => {
  try {
    const term = req.body.term;
    const till_id = req.body.till_id;
    const categories = await StockCategories.getCategoriesByTillId(till_id, "tree");
    if (!categories) {
      throw "No categories found";
    }
    
    const flatCategories = Helpers.flatten(categories);
    let results = [];

    for await (const category of flatCategories) {
      if (category.name.toLowerCase().search(term.toLowerCase()) != -1) {
        results.push(category);
      }
    }
    
    res.send({ status: "ok", results: results.slice(0, 3) });
  } catch (error) {
    res.send({ status: "fail", results: []});
  }
});

module.exports = router;
