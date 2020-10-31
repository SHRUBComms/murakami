// /api/post/tills/reports/unit-sales

const router = require("express").Router();

const lodash = require("lodash");
const moment = require("moment");
moment.locale("en-gb");

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Tills = Models.Tills;
const Transactions = Models.Transactions;
const StockCategories = Models.StockCategories;

const Auth = require(rootDir + "/app/configs/auth");
const Helpers = require(rootDir + "/app/helper-functions/root");

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
    
    let categories = await StockCategories.getCategories("treeKv");
    let unitSales = {};

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

    for await (const transaction of transactions) {
      if(!transaction.summary.bill) {
        continue;
      }

      if(transaction.summary.bill.length == 0) {
        continue;
      }

      if (["membership", "donation", "volunteering", "refund"].includes(transaction.summary.bill[0].item_id)) {
        continue;
      }

      if(!["cash", "card"].includes(transaction.summary.paymentMethod)) {
        continue;
      }

      if (transaction.summary.paymentMethod == "card" && !transaction.summary.sumupId) {
        continue;
      } 

      if (transaction.summary.totals.money == 0 && transaction.summary.totals.tokens == 0) {
        continue;
      }

      for await(let item of transaction.summary.bill) {
        if (!categories[item.item_id]) {
          continue;
        }
        
        if (item.condition) {
          categories[item.item_id + "_" + item.condition] = lodash.cloneDeep(categories[item.item_id]);
          item.item_id += "_" + item.condition;
          categories[item.item_id].absolute_name += " (" + lodash.startCase(item.condition) + ")";
        }

        if (!unitSales[item.item_id]) {
          if (categories[item.item_id].group_id) {
            categories[item.item_id].groupName = req.user.allWorkingGroupsObj[categories[item.item_id].group_id].name || "-";
          }

          unitSales[item.item_id] = {
            salesInfo: {
              totalSales: 0,
              totalRevenue: 0,
              boughtByMember: 0,
              boughtByNonMember: 0,
              memberRatio: 0
            },
            categoryInfo:
              categories[
                item.item_id
              ]
          };

          unitSales[item.item_id].categoryInfo.name = categories[item.item_id].absolute_name || categories[item.item_id].name;
        }

        try {
          unitSales[item.item_id].salesInfo.totalSales += +(parseInt(item.quantity) || 1);
        } catch (error) {
          unitSales[item.item_id].salesInfo.totalSales += +1;
        }

        unitSales[item.item_id].salesInfo.totalRevenue = parseFloat(parseFloat(unitSales[item.item_id].salesInfo.totalRevenue) + (parseFloat(item.value) || parseFloat(item.tokens) || 0)).toFixed(2);

        if (transaction.member_id != "anon") {
          unitSales[item.item_id].salesInfo.boughtByMember += +1;
        }

        unitSales[item.item_id].salesInfo.memberRatio = ((unitSales[item.item_id].salesInfo.boughtByMember / unitSales[item.item_id].salesInfo.totalSales) * 100 || 0).toFixed(2);
      } 
    }

    res.send({ status: "ok", unitSales: lodash.values(unitSales)});
  } catch (error) {
    console.log(error);
    res.send({ status: "fail", unitSales: [] });
  }
});
module.exports = router;
