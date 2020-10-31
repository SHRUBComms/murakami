// /api/get/tills/smp-callback

const router = require("express").Router();

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Carbon = Models.Carbon;
const Transactions = Models.Transactions;

const Auth = require(rootDir + "/app/configs/auth");
const Helpers = require(rootDir + "/app/helper-functions/root");

router.get("/", Auth.isLoggedIn, Auth.canAccessPage("tills", "processTransaction"), async (req, res) => {
  let murakamiTransaction;

  let redirectUri = `${process.env.PUBLIC_ADDRESS}/till/transaction/${req.query.till_id}/?sumupCallback=true&murakamiStatus=${req.query.murakamiStatus}&transactionSummary=${req.query.transactionSummary}&carbonSummary=${req.query.carbonSummary}&smp-status=${req.query["smp-status"]}&smp-failure-cause=${req.query["smp-failure-cause"]}`;
  const verificationErrorUri = `${process.env.PUBLIC_ADDRESS}/till/transaction/${req.query.till_id}/?sumupCallback=true&murakamiStatus=${req.query.murakamiStatus}&transactionSummary=${req.query.transactionSummary}&carbonSummary=${req.query.carbonSummary}&smp-status=failed&smp-failure-cause=Could not verify card payment.`;

  try {

    const accessToken = await Helpers.SumUpAuth();

    if(!accessToken) {
      throw "Could not access SumUp";
    }
    const sumupTransaction = await Helpers.SumUpGetTransaction(req.query["smp-tx-code"], accessToken);
    if(!sumupTransaction) {
      throw "SumUp transaction not found";
    }
    
    murakamiTransaction = await Transactions.getById(req.query["foreign-tx-id"]);
    if (!murakamiTransaction) {
      throw "Murakami transaction not found";
    }
    
    if (murakamiTransaction.summary.paymentMethod != "card") {
      throw "Invalid Murakami transaction";
    }
    
    if (sumupTransaction.amount != murakamiTransaction.summary.totals.money) {
      throw "SumUp records do not match Murakami";
    }
    
    if (sumupTransaction.status != "SUCCESSFUL") {
      throw "SumUp transactionf failed at point of payment";
    }
    
    let updatedSummary = murakamiTransaction.summary;
    updatedSummary.sumupId = sumupTransaction.transaction_code;
    await Transactions.update({ summary: updatedSummary }, { where: { transaction_id: murakamiTransaction.transaction_id }});
                        
    redirectUri += `&murakamiTransactionId=${murakamiTransaction.transaction_id}`;
    res.redirect(redirectUri);

  } catch (error) {
    if(murakamiTransaction) {
      await Transactions.removeTransaction(murakamiTransaction.transaction_id);
      await Carbon.removeTransaction(murakamiTransaction.transaction_id);
    }
    res.redirect(verificationErrorUri);
  }
});

module.exports = router;
