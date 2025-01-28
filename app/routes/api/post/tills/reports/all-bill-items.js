const router = require("express").Router();
const moment = require("moment");
const lodash = require("lodash");
moment.locale("en-gb");

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Tills = Models.Tills;
const Transactions = Models.Transactions;
const Members = Models.Members;
const StockCategories = Models.StockCategories;
const Helpers = require(rootDir + "/app/controllers/helper-functions/root");

const Auth = require(rootDir + "/app/controllers/auth");
const { handleTransaction } = require("./handlers");

router.post("/", Auth.isLoggedIn, Auth.canAccessPage("tills", "viewReports"), async (req, res) => {
  try {
    const datePeriod = req.body.datePeriod || "today";
    const startDateRaw = req.body.startDate || null;
    const endDateRaw = req.body.endDate || null;

    const { formattedStartDate, formattedEndDate } = await Helpers.plainEnglishDateRangeToDates(
      datePeriod,
      startDateRaw,
      endDateRaw
    );

    // Get all tills
    const tills = await Tills.findAll({});

    const categories = await StockCategories.getCategories("treeKv");
    const billItems = [];

    for (const till of tills) {
      const transactions = await Transactions.getAllBetweenTwoDatesByTillId(
        till.till_id,
        formattedStartDate,
        formattedEndDate
      );

      for (const transaction of transactions) {
        const transactionBillItems = handleTransaction({ transaction, till, categories });
        if (transactionBillItems.length > 0) {
          billItems.push(...transactionBillItems);
        }
      }
    }

    res.send(billItems);
  } catch (error) {
    console.error(error);
    res.send([]);
  }
});

module.exports = router;
