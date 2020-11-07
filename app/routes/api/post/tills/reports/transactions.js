// /api/post/tills/reports/transactions

const router = require("express").Router();

const moment = require("moment");
moment.locale("en-gb");

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Tills = Models.Tills;
const Transactions = Models.Transactions;
const Members = Models.Members;
const StockCategories = Models.StockCategories;

const Auth = require(rootDir + "/app/controllers/auth");
const Helpers = require(rootDir + "/app/controllers/helper-functions/root");

router.post("/", Auth.isLoggedIn, Auth.canAccessPage("tills", "viewReports"), async (req, res) => {
  

  try {

    const till_id = req.body.till_id;
    const datePeriod = req.body.datePeriod || "today";

    const startDateRaw = req.body.startDate || null;
    const endDateRaw = req.body.endDate || null;

    if (!till_id) {
      throw "No till specified";
    }

    const till = await Tills.getById(till_id);

    if (!till) {
      throw "Till not found";
    }
    
    const { formattedStartDate, formattedEndDate } = await Helpers.plainEnglishDateRangeToDates(datePeriod, startDateRaw, endDateRaw);
    const transactions = await Transactions.getAllBetweenTwoDatesByTillId(till_id, formattedStartDate, formattedEndDate);
    
    const { membersObj } = await Members.getAll();
    const categories = await StockCategories.getCategories("treeKv");
    const formattedTransactions = await Transactions.formatTransactions(transactions, membersObj, categories, till_id);

    let sanitizedFormattedTransactions = [];

    for await (const transaction of formattedTransactions) {
      if (!transaction.paymentFailed && !transaction.isRefund) {
        sanitizedFormattedTransactions.push(transaction);
      }
    }

    res.send(sanitizedFormattedTransactions);
  } catch (error) {
    console.log(error);
    res.send([]);
  }
});
module.exports = router;
