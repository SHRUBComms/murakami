// /api/post/members/remote-add

const router = require("express").Router();
const moment = require("moment");
moment.locale("en-gb");

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Members = Models.Members;
const Transactions = Models.Transactions;
const StockCategories = Models.StockCategories;

const Auth = require(rootDir + "/app/controllers/auth");
const Mail = require(rootDir + "/app/controllers/mail/root");
const validateMember = require(rootDir + "/app/controllers/members/validateMember");
const MailchimpAPI = require(rootDir + "/app/controllers/mailchimp");
const Helpers = require(rootDir + "/app/controllers/helper-functions/root");

router.post("/", Auth.verifyByKey("membershipSignUp"), async (req, res) => {
  try {

    let membershipCost = req.body.amount;
    const membershipLength = req.body.period;
    const membershipLengthPlain = (membershipLength == "full-year") ? "Full" : "Half";
    const membershipItemId = (membershipLength == "full-year") ? "v8H4GDSvQ5" : "pdN6RMaP6S";
    const transactionComment = `${membershipLengthPlain} year of membership, via website.`;

    if(!["half-year", "full-year"].includes(membershipLength)) {
      throw "Please select a valid membership period";
    }

    if(isNaN(membershipCost)) {
      throw "Please enter a valid amount to pay";
    }

    membershipCost = Number(membershipCost).toFixed(2);

    if(membershipLength == "full-year" && membershipCost < 12) {
      throw "For a full year membership, please enter at least £12.00";
    } else if (membershipLength == "half-year" && membershipCost < 8) {
      throw "For a half year membership, please enter at least £8.00";
    }

    await validateMember(req.params, req.body);

    const emailInUse = await Members.getByEmail(req.body.email);
    if (emailInUse) {
      throw "Looks like you already have a membership! Please <a href='/renew?memberId=" + emailInUse.member_id + "'>renew your existing membership</a>";
    }

    const accessToken = await Helpers.SumUpAuth();

    let contactPreferences = {};

    if (req.body.behaviourChangeSurveyConsent == "on") {
      contactPreferences.behaviourChangeSurvey = true;
    }

    const today = new Date();

    const sanitizedMember = {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      phone_no: req.body.phone_no,
      address: req.body.address,
      free: 0,
      membership_type: "unpaid",
      earliest_membership_date: today,
      current_init_membership: today,
      current_exp_membership: today,
      contactPreferences: contactPreferences
    };

    if (req.body.generalNewsletterConsent == "on") {
        await MailchimpAPI.subscribeToNewsletter(process.env.SHRUB_MAILCHIMP_NEWSLETTER_LIST_ID, process.env.SHRUB_MAILCHIMP_SECRET_API_KEY, sanitizedMember);
    }

    const memberId = await Members.add(sanitizedMember);

    const murakamiTransaction = {
      till_id: "website",
      user_id: "website",
      member_id: memberId,
      date: new Date(),
      summary: {
        bill: [{ value: membershipCost, weight: 0, item_id: membershipItemId, quantity: 1, condition: null }], 
        totals: { money: membershipCost }, paymentMethod: "card",
        comment: transactionComment
      } 
    }

    const murakamiTransactionId = await Transactions.addTransaction(murakamiTransaction);

    const SumUpCheckout = await Helpers.SumUpCreateCheckout(murakamiTransactionId, membershipCost, transactionComment, accessToken);

    res.status(200);
    res.send({ SumUp: { merchant_code: SumUpCheckout.merchant_code, id: SumUpCheckout.id }, murakami: { transaction_id: murakamiTransactionId, member_id: memberId }});

  } catch (error) {
    if(typeof error != "string") {
      error = "Something went wrong!"
    }
    
    res.status(400);
    res.send({ error });
  }
});

router.post("/verify-payment", Auth.verifyByKey("membershipSignUp"), async (req, res) => {
  try {
    const SumUpTransactionId = req.body.SumUpTransactionId;
    const murakamiTransactionId = req.body.murakamiTransactionId;

    if(!SumUpTransactionId) {
      throw "Could not find SumUp transaction";
    }

    if(!murakamiTransactionId) {
      throw "Could not find Murakami transaction";
    }

    const murakamiTransaction = await Transactions.getById(murakamiTransactionId);

    if(!murakamiTransaction) {
      throw "Something went wrong processing your payment";
    }

    if(murakamiTransaction.till_id != "website" || murakamiTransaction.user_id != "website") {
      throw "Something went wrong processing your payment";
    }

    if(murakamiTransaction.summary.sumUpId) {
      throw "This transaction has already been verified";
    }
    
    const accessToken = await Helpers.SumUpAuth();

    if(!accessToken) {
      throw "Could not connect to SumUp";
    }
    
    // Fetch SumUp transaction by SumUp ID and Murakami ID - verify that they match
    const SumUpTransaction = await Helpers.SumUpGetTransaction(SumUpTransactionId, accessToken);

    if(!SumUpTransaction) {
      throw "Something went wrong processing your payment";
    }

    if (SumUpTransaction.status != "SUCCESSFUL") {
      throw "Payment was not successful";
    }

    // Verify amounts match
    if(Number(SumUpTransaction.amount) != Number(murakamiTransaction.summary.totals.money)) {
      throw "Payment amount do not match";
    }

    // Verify dates match
    if(moment(murakamiTransaction.date).format("L") != moment(SumUpTransaction.timestamp).format("L")) {
      throw "Transaction dates do not match";
    }

    // Verify SumUp transaction ID isn't already in system
    const sumupIdAlreadyUsed = await Transactions.getBySumUpId(SumUpTransaction.transaction_code);

    if(sumupIdAlreadyUsed) {
      throw "SumUp transaction is already in system";
    }

    // Get action from Murakami transaction item ID
    const categories = await StockCategories.getAllCategories();

    const action = categories[murakamiTransaction.summary.bill[0].item_id].action;

    if(!action) {
      throw "Something went wrong processing your payment";
    }

    const today = new Date();
    let newExpirationDate;
    if(action == "MEM-FY") {
      newExpirationDate = moment(today).add(12, "months").toDate();
    } else if (action == "MEM-HY") {
      newExpirationDate = moment(today).add(6, "months").toDate();
    } else {
      throw "Something went wrong!";
    }

    await Members.update({ current_exp_membership: newExpirationDate, is_member: 1, membership_type: null }, { where: { member_id: murakamiTransaction.member_id } });

    // Update transaction summary
    let updatedSummary = murakamiTransaction.summary;
    updatedSummary.sumupId = SumUpTransaction.transaction_code;
    await Transactions.update({ summary: updatedSummary }, { where: { transaction_id: murakamiTransactionId }});
    Mail.sendAutomatedMember("welcome-paid-member", murakamiTransaction.member_id);

    res.status(200);
    res.send();
  } catch (error) {
    if(typeof error != "string") {
      error = "Your payment could not be verified. You may have been charged - please contact support";
    }
  
    res.status(400);
    res.send({ error });
  }
});

module.exports = router;
