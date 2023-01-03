// /api/post/tills/reports/quick-summary

const router = require("express").Router();

const moment = require("moment");
moment.locale("en-gb");

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Tills = Models.Tills;
const Transactions = Models.Transactions;

const Auth = require(rootDir + "/app/controllers/auth");
const Helpers = require(rootDir + "/app/controllers/helper-functions/root");

router.post("/", Auth.isLoggedIn, Auth.canAccessPage("tills", "viewTill"), async (req, res) => {
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

    let summary = {
      numberOfTransactions: 0,
      revenue: {
        total: 0,
        breakdown: {
          card: 0,
          cash: 0,
          unknown: 0
        }
      },
      tokens: {
        spent: 0,
        issued: 0
      }
    }

    for await(const transaction of transactions) {
    console.log(transaction.summary);
      if (["membership", "donation", "volunteering", "refund"].includes(transaction.summary.bill[0].item_id)) {
        summary.tokens.issued += Number(transaction.summary.totals.tokens);
      } else {
	if (transaction.summary.totals.money > 0) {
          summary.numberOfTransactions += 1;

          if (transaction.summary.paymentMethod == "cash") {
            summary.revenue.breakdown.cash += Number(transaction.summary.totals.money);
            summary.revenue.total += Number(transaction.summary.totals.money);
          } else if (transaction.summary.paymentMethod == "card" && transaction.summary.sumupId) {
            summary.revenue.breakdown.card += Number(transaction.summary.totals.money);
            summary.revenue.total += Number(transaction.summary.totals.money);
          }
        }

        if (transaction.summary.totals.tokens > 0) {
          summary.tokens.spent += Number(transaction.summary.totals.tokens);
        }
      }
	
    console.log("\n---------\n");
    }

    res.send({ status: "ok", summary: summary });
  } catch (error) {
    res.send({ status: "fail" });
  }
});

module.exports = router;
