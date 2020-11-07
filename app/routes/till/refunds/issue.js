// /till/refunds/issue

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

const refundPeriod = 14;

router.post("/", Auth.isLoggedIn, Auth.canAccessPage("tills", "processTransaction"), async (req, res) => {
  try {
    const till_id = req.body.tillId;
    const transaction_id = req.body.transactionId;
    const refund_type = req.body.refundType;
    const action = req.body.action;
    const amount = req.body.amount;
    const response = { status: "fail", transaction: {} };

    if (!till_id) {
      throw "Please select a valid till";
    }

    if (!transaction_id) {
      throw "Please enter a transaction ID"
    }
    
    if (!refund_type) {
      throw "Please select a refund type";
    }
    
    if (!action) {
      throw "Please select an action";
    }
    
    if (!(action == "lookup" || (action == "issue" && !isNaN(amount)))) {
      throw "Please select a valid action";
    }
    
    if (!["sumup", "murakami"].includes(refund_type)) {
      throw "Please select a valud refund type";
    }

    const till = await Tills.getOpenTill(till_id);
    
    if (!(req.user.permissions.tills.processRefunds == true || (req.user.permissions.tills.processRefunds == "commonWorkingGroup" && req.user.working_groups.includes(till.group_id)))) {
      throw "You don't have permission to process transactions on this till!";
    }
    
    const { totalTakings, totalRefunds } = await Transactions.getTotalCashTakingsSince(till.till_id, till.openingTimestamp);
    const tillBalance = Number(till.openingFloat) + (Number(totalTakings) - Number(totalRefunds));
    
    const transaction = await Transactions.getByMurakamiOrSumUpId(till_id, transaction_id);

    if (!transaction) {
      throw "Transaction not found. Please check that the transaction ID was entered correctly and try again";
    }
    
    if (transaction.summary.refunded) {
      throw "Transaction has already been refunded!";
    }

    if (moment(transaction.date).endOf("day").isBefore(moment().subtract(refundPeriod, "days"))) { // come back
      throw `Transactions is older than ${ refundPeriod } day(s)`;
    }
    
    if (["membership", "donation", "volunteering", "refund"].includes(transaction.summary.bill[0].item_id)) {
      throw "This transaction is non-refundable";
    }
    
    if (transaction.summary.totals.money == 0) {
      throw "Transaction can't be refunded - money was not used as the payment method";
    }

    if(!["cash", "card"].includes(transaction.summary.paymentMethod)) {
      throw "Transaction can't be refunded - money was not used as the payment method";
    }

    if(action == "lookup") {
      const { membersObj } = await Members.getAll();
      const categories = await StockCategories.getCategoriesByTillId(till_id, "treeKv");
      const formattedTransactions = await Transactions.formatTransactions([transaction], membersObj, categories, till_id);
      res.send({ status: "ok", transaction: formattedTransactions[0] });
    } else {
      if (transaction.summary.sumupId) {
        const accessToken = await Helpers.SumUpAuth();
        if (!accessToken) {
          throw "Something went wrong connecting to SumUp! Please try again";
        }
      
        const sumupTransaction = await Helpers.SumUpGetTransaction(transaction.summary.sumupId, accessToken);
      
        if (!sumupTransaction) {
          throw "Transaction could not be verified with SumUp";
        }
        
        if (sumupTransaction.amount != transaction.summary.totals.money) {
          throw "Murakami and SumUp's records are inconsistent - please contact support";
        }
                                                              
        if (sumupTransaction.status != "SUCCESSFUL") {
          throw "Transaction failed at point of purchase";
        }

        if (Number(amount) > sumupTransaction.amount || Number(amount) < 0.01) {
          throw "Please enter a valid refund amount";
        }
        // Issue sumup refund.
        await Helpers.SumUpIssueRefund(sumupTransaction.id, amount, accessToken);
        await Transactions.processRefund(amount, transaction);

        res.send({ status: "ok", msg: "Refund successfully issued by SumUp" });
      } else {
        if (Number(amount) > Number(transaction.summary.totals.money)) {
          throw "Please enter a valid refund amount";
        } 

        if(Number(amount) < 0.01) {
          throw "Please enter a valid refund amount";
        } 

        if(Number(amount) > Number(tillBalance)) {
          throw "Not enough money in till to issue refund!";
        }
        
        await Transactions.processRefund(amount, transaction);
        res.send({ status: "ok", msg: `Refund successfully recorded - please give the customer £${ Number(amount).toFixed(2) }`});
        response.status = "ok";
      }
    }
  } catch (error) {
    if(typeof error != "string") {
      error = "Something went wrong! Please try again";
    }
    res.send({ status: "fail", msg: error });
  }
});

module.exports = router;
