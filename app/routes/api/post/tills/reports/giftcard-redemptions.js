// /api/post/tills/reports/giftcard-redemptions

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
    
    const { formattedStartDate, formattedEndDate } = await Helpers.plainEnglishDateRangeToDates(datePeriod, startDateRaw, endDateRaw);
    const transactions = await Transactions.getAllBetweenTwoDatesByTillId(till_id, formattedStartDate, formattedEndDate);
    
    const { membersObj } = await Members.getAll();

    let categories = await StockCategories.getCategories("treeKv");
    let giftcardRedemptions = [];

    for await (const transaction of transactions) {
      if(!transaction.summary.bill) {
        continue;
      }

      if(transaction.summary.bill.length == 0) {
        continue;
      }

      if (["volunteering", "refund"].includes(transaction.summary.bill[0].item_id)) {
        continue;
      }

      if(!transaction.summary.totals.giftcard) {
        continue;
      }

      if (transaction.summary.paymentMethod == "card" && !transaction.summary.sumupId) {
        continue;
      } 

      const giftcardItem = transaction.summary.bill.find(function(item) { return item.item_id == "giftcard" });

      let spentOnMembership = false;
      let spentOnDonation = 0;
      let spentOnSales = false;

      for await(const item of transaction.summary.bill) {
        if(categories[item.item_id]) {
          if((categories[item.item_id].action || "").substring(0, 3) == "MEM") {
            spentOnMembership = true;
          } else if(categories[item.item_id].action == "DONATION") {
            spentOnDonation += Number(item.value) || Number(item.tokens);
          } else {
            spentOnSales = true;
          }
        } else if(item.item_id == "donation") {
          spentOnDonation += Number(item.value) || Number(item.tokens);
        }
      }

      let giftcardRedemption = {
        transaction_id: transaction.transaction_id,
        till: transaction.till_id,
        dateOfInitialSale: moment(new Date(giftcardItem.dateGiftcardPurchased)).format("MMMM YYYY"),
        dateOfRedemption: moment(transaction.date).format("L"),
        giftcardBalance: giftcardItem.value,
        amountSpent: transaction.summary.totals.giftcard - (spentOnDonation || 0),
        amountDonated: spentOnDonation || 0,
        purchaseType: {
          donation: spentOnDonation ? "Yes" : "No",
          sales: spentOnSales ? "Yes" : "No",
          membership: spentOnMembership ? "Yes" : "No"
        },
        member: "Non-member"
      }
      
      if(transaction.member_id != "anon") {
        if(membersObj[transaction.member_id]) {
          giftcardRedemption.member = membersObj[transaction.member_id].first_name + " " + membersObj[transaction.member_id].last_name;
        }
      }

      giftcardRedemptions.push(giftcardRedemption); 
    }

    res.send({ status: "ok", giftcardRedemptions: giftcardRedemptions });
  } catch (error) {
    console.log(error);
    res.send({ status: "fail", giftcardRedemptions: [] });
  }
});
module.exports = router;
