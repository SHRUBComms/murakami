// /till/receipt/print

const router = require("express").Router();
const moment = require("moment");
moment.locale("en-gb");

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Tills = Models.Tills;
const Transactions = Models.Transactions;
const StockCategories = Models.StockCategories;
const Members = Models.Members;
const Carbon = Models.Carbon;
const CarbonCategories = Models.CarbonCategories;

const Helpers = require(rootDir + "/app/controllers/helper-functions/root");
const Auth = require(rootDir + "/app/controllers/auth");

router.post("/:transaction_id", Auth.isLoggedIn, Auth.canAccessPage("tills", "processTransaction"), async (req, res) => {
  try {
    const transaction_id = req.body.transaction_id;

    let carbon = {};

    if (!transaction_id) {
      throw "No transaction ID specified";
    }
    
    const transaction = await Transactions.getById(transaction_id);
    if (!transaction) {
      throw "Transaction not found";
    }

    if (!moment(transaction.date).isBetween(moment().startOf("day"), moment().endOf("day"))) {
      throw "Transaction didn't happen today";
    }
    
    const till = await Tills.getOpenTill(transaction.till_id);
    
    const simpleCarbon = await Carbon.getByFxId(transaction.transaction_id);
    const carbonCategories = await CarbonCategories.getAll();
    
    const carbonSaved = await Helpers.calculateCarbon(simpleCarbon, carbonCategories);
    
    carbon.savedThisTransaction = Math.abs((carbonSaved * 1e-3).toFixed(2));
    const { membersObj } = await Members.getAll();
    const stockCategories = await StockCategories.getCategoriesByTillId(transaction.till_id, "treeKv");
    const formattedTransactions = await Transactions.formatTransactions([transaction], membersObj, stockCategories, transaction.till_id);
    const formattedTransaction = formattedTransactions[0];

    formattedTransaction.till_name = till.name;

    if (carbon.savedThisTransaction > 0) {
      formattedTransaction.carbon = carbon; 
    }

    res.render("till/receipt/print", {
      layout: "",
      title: "Receipt",
      transaction: formattedTransaction
    });
  } catch (error) {
    res.render("till/receipt", {
      layout: "",
      title: "Receipt"
    }); 
  }
});

module.exports = router;
