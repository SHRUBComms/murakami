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
    // Destructure inputs with defaults
    const {
      datePeriod = "today",
      startDate: startDateRaw = null,
      endDate: endDateRaw = null,
    } = req.body;

    // Convert plain English date range to actual dates
    const { formattedStartDate, formattedEndDate } = await Helpers.plainEnglishDateRangeToDates(
      datePeriod,
      startDateRaw,
      endDateRaw
    );

    // Get all tills
    const tills = await Tills.findAll({});

    // Retrieve stock categories
    const categories = await StockCategories.getCategories("treeKv");

    // Fetch transactions concurrently for every till, compile the bill items for each
    const billItemsPromises = tills.map(async (till) => {
      const transactions = await Transactions.getAllBetweenTwoDatesByTillId(
        till.till_id,
        formattedStartDate,
        formattedEndDate
      );
      const billItemsForTill = [];
      for (const transaction of transactions) {
        const transactionBillItems = handleTransaction({ transaction, till, categories });
        if (transactionBillItems.length > 0) {
          billItemsForTill.push(...transactionBillItems);
        }
      }
      return billItemsForTill;
    });

    // Wait until all concurrent tasks complete and flatten the bill items
    const billItemsArrays = await Promise.all(billItemsPromises);
    const billItems = billItemsArrays.flat();

    // Return the bill items with a proper HTTP status
    res.status(200).json(billItems);
  } catch (error) {
    console.error("Error while fetching bill items:", error);
    res.status(500).json({ error: "An error occurred while retrieving bill items" });
  }
});

module.exports = router;
