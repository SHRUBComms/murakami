// /api/get/tills/transactions

const router = require("express").Router();
const moment = require("moment");
moment.locale("en-gb");

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Tills = Models.Tills;
const TillActivity = Models.TillActivity;
const StockCategories = Models.StockCategories;
const Transactions = Models.Transactions;
const Members = Models.Members;

const Auth = require(rootDir + "/app/controllers/auth");

router.get("/:till_id", Auth.isLoggedIn, async (req, res) => {
  try {
    const till = await Tills.getById(req.params.till_id);

    if(!till) {
      throw "Till not found"
    }

    if(till.disabled == 1) {
      throw "Till is disabled";
    }

    const status = await TillActivity.getByTillId(req.params.till_id);

    if(!req.query.startDate && status.opening == 0) {
      throw "Enter start date";
    }

    const transactions = await Transactions.getAllBetweenTwoDatesByTillId(req.params.till_id, req.query.startDate || status.timestamp, req.query.endDate || new Date());
    
    if (transactions.length == 0) {
      throw "No transactions found";
    }
    
    const { membersObj } = await  Members.getAll();
    const categories = await StockCategories.getCategoriesByTillId(req.params.till_id, "treeKv");

    const formattedTransactions = await Transactions.formatTransactions(transactions, membersObj, categories, req.params.till_id);
    res.send(formattedTransactions);
  } catch (error) {
    res.send([]);
  }
});

module.exports = router;
