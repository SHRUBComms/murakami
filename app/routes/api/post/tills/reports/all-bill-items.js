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

    for (let i = 0; i < tills.length; i++) {
      const till = tills[i];
      const transactions = await Transactions.getAllBetweenTwoDatesByTillId(
        till.till_id,
        formattedStartDate,
        formattedEndDate
      );

      for (const transaction of transactions) {
        if (!transaction.summary.bill || transaction.summary.bill.length === 0) {
          continue;
        }

        // Skip failed card transactions
        if (transaction.summary.paymentMethod === "card" && !transaction.summary.sumupId) {
          continue;
        }
        const transactionDiscountMultiplier =
          1 -
          transaction.summary.bill
            .filter((i) => i.discount === 1)
            .reduce((acc, item) => acc + (item.value || 0), 0) /
            100;
        const transactionDiscountAbsolute = transaction.summary.bill
          .filter((i) => i.discount === 2)
          .reduce((acc, item) => acc - (item.value || 0), 0);

        for (const item of transaction.summary.bill) {
          if (
            (!categories[item.item_id] && !["giftcard", "yoyoCup"].includes(item.item_id)) ||
            item.item_id === "donation" ||
            categories[item.item_id]?.discount > 0
          ) {
            continue;
          }

          const billItem = {
            transaction_id: transaction.transaction_id,
            date: moment(transaction.date).format("L"),
            till_name: till.name,
            isMember: transaction.member_id !== "anon",
            item:
              item.item_id === "giftcard"
                ? "Giftcard"
                : item.item_id === "donation"
                  ? "Donation"
                  : item.item_id === "yoyoCup"
                    ? "Yoyo Cup Return"
                    : categories[item.item_id].absolute_name,
            quantity: item.quantity || 1,
            value: item.value * transactionDiscountMultiplier || 0,
            condition: item.condition ? lodash.startCase(item.condition) : "-",
            payment_method: lodash.startCase(transaction.summary.paymentMethod || "-"),
            transactionTotalDiscount: transactionDiscountAbsolute,
            transactionTotalTokens: transaction.summary.totals.tokens,
            sumupId: transaction.summary.sumupId,
            allowsTokens: Boolean(categories[item.item_id]?.allowTokens),
          };

          billItems.push(billItem);
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
