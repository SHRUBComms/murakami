// /api/post/tills/reports/giftcard-sales

const router = require("express").Router();

const lodash = require("lodash");
const moment = require("moment");
moment.locale("en-gb");

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Tills = Models.Tills;
const Transactions = Models.Transactions;
const StockCategories = Models.StockCategories;
const Members = Models.Members;

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

    const { formattedStartDate, formattedEndDate } = await Helpers.plainEnglishDateRangeToDates(
      datePeriod,
      startDateRaw,
      endDateRaw
    );
    const transactions = await Transactions.getAllBetweenTwoDatesByTillId(
      till_id,
      formattedStartDate,
      formattedEndDate
    );

    const { membersObj } = await Members.getAll();

    const categories = await StockCategories.getCategories("treeKv");
    const giftcardSales = [];

    for await (const transaction of transactions) {
      if (!transaction.summary.bill) {
        continue;
      }

      if (transaction.summary.bill.length == 0) {
        continue;
      }

      if (
        ["membership", "donation", "volunteering", "refund"].includes(
          transaction.summary.bill[0].item_id
        )
      ) {
        continue;
      }

      if (!["cash", "card"].includes(transaction.summary.paymentMethod)) {
        continue;
      }

      if (transaction.summary.paymentMethod == "card" && !transaction.summary.sumupId) {
        continue;
      }

      if (transaction.summary.totals.money == 0 && transaction.summary.totals.tokens == 0) {
        continue;
      }

      for await (const item of transaction.summary.bill) {
        if (!categories[item.item_id]) {
          continue;
        }

        if (categories[item.item_id].action != "giftcard") {
          continue;
        }

        const giftcardSale = {
          transaction_id: transaction.transaction_id,
          till: transaction.till_id,
          date: moment(transaction.date).format("L"),
          value: item.value,
          member: "Non-member",
        };

        if (transaction.member_id != "anon") {
          if (membersObj[transaction.member_id]) {
            giftcardSale.member =
              membersObj[transaction.member_id].first_name +
              " " +
              membersObj[transaction.member_id].last_name;
          }
        }

        for (let i = 0; i < item.quantity; i++) {
          giftcardSales.push(giftcardSale);
        }
      }
    }

    res.send({ status: "ok", giftcardSales: giftcardSales });
  } catch (error) {
    console.log(error);
    res.send({ status: "fail", giftcardSales: [] });
  }
});
module.exports = router;
