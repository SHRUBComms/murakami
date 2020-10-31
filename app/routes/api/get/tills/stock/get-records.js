// /api/get/tills/stock/get-records

const router = require("express").Router();

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const StockRecords = Models.StockRecords;
const StockCategories = Models.StockCategories;
const Users = Models.Users;

const Auth = require(rootDir + "/app/configs/auth");

router.get("/:item_id", Auth.isLoggedIn, Auth.canAccessPage("tills", "viewStock"), async (req, res) => {
  try { 

    const category = await StockCategories.getCategoryById(req.params.item_id);

    if(!category) {
      throw "Category not found";
    }

    if(!req.query.condition) {
      throw "Enter a condition";
    }

    const records = await StockRecords.getRecords(req.params.item_id, req.query.condition);
    
    if (!records) {
      throw "No records found";
    }
    
    if (records.length == 0) {
      throw "No records found"
    }
    
    const { usersObj } = await Users.getAll(req.user);
    const formattedRecords = await StockRecords.formatRecords(records, usersObj, null, null);

    res.send(formattedRecords);
  } catch (error) {
    console.log(error);
    res.send([]);
  }
});
module.exports = router;
