// /api/post/tills/reports/discounts

const router = require("express").Router();

const lodash = require("lodash");
const moment = require("moment");
moment.locale("en-gb");

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Tills = Models.Tills;
const Transactions = Models.Transactions;
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

    const categories = await StockCategories.getCategories("treeKv");
    const discounts = {};

    for await (const category_id of Object.keys(categories)) {
      const category = categories[category_id];
      try {
        if (category.group_id) {
          if (req.user.allWorkingGroupsObj[category.group_id]) {
            category.groupName = req.user.allWorkingGroupsObj[category.group_id].name || "-";
          }
        }
      } catch (error) {
        category.groupName = "-";
      }
    }

    const discountedTransactions = [];

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

        if (item.discount) {
          if (![1, 2].includes(item.discount)) {
            continue;
          }
        } else {
          continue;
        }

        if (!discounts[item.item_id]) {
          discounts[item.item_id] = {
            salesInfo: {
              numberOfDiscountedTransactions: 0,
              preDiscountRevenue: 0,
              postDiscountRevenue: 0,
              totalDiscountedRevenue: 0,
            },
            transactions: [],
            discountInfo: categories[item.item_id],
          };

          discounts[item.item_id].discountInfo.name =
            categories[item.item_id].absolute_name || categories[item.item_id].name;
        }

        // Add one to number of total transactions using this discount
        if (!discounts[item.item_id].transactions.includes(transaction.transaction_id)) {
          discounts[item.item_id].salesInfo.numberOfDiscountedTransactions =
            parseFloat(discounts[item.item_id].salesInfo.numberOfDiscountedTransactions) + 1;
          discounts[item.item_id].transactions.push(transaction.transaction_id);
        }

        const discountedTransactionAmount = parseFloat(transaction.summary.totals.money) || 0;
        const originalTransactionAmount =
          item.discount == 1
            ? parseFloat(discountedTransactionAmount / ((100 - item.value) / 100)) || 0
            : parseFloat(discountedTransactionAmount + item.value);

        discounts[item.item_id].salesInfo.preDiscountRevenue = parseFloat(
          parseFloat(discounts[item.item_id].salesInfo.preDiscountRevenue) +
            parseFloat(originalTransactionAmount)
        ).toFixed(2);
        discounts[item.item_id].salesInfo.postDiscountRevenue = parseFloat(
          parseFloat(discounts[item.item_id].salesInfo.postDiscountRevenue) +
            parseFloat(discountedTransactionAmount)
        ).toFixed(2);
        discounts[item.item_id].salesInfo.totalDiscountedRevenue = parseFloat(
          parseFloat(discounts[item.item_id].salesInfo.totalDiscountedRevenue) +
            (originalTransactionAmount - discountedTransactionAmount)
        ).toFixed(2);
      }
    }

    res.send({ status: "ok", discounts: lodash.values(discounts) });
  } catch (error) {
    console.log(error);
    res.send({ status: "fail", discounts: [] });
  }
});
module.exports = router;
