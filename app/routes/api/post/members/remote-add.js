// /api/post/members/remote-add

const router = require("express").Router();
const moment = require("moment");
moment.locale("en-gb");

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Members = Models.Members;
const Tills = Models.Tills;

const Auth = require(rootDir + "/app/controllers/auth");
const Mail = require(rootDir + "/app/controllers/mail/root");
const validateMember = require(rootDir + "/app/controllers/members/validateMember");
const MailchimpAPI = require(rootDir + "/app/controllers/mailchimp");

router.post("/", Auth.verifyByKey("membershipSignUp"), async (req, res) => {
  try {
    let membershipCost = 1.0;

    await validateMember(req.params, req.body);

    const emailInUse = await Members.getByEmail(req.body.email);
    if (emailInUse) {
        throw "Email address is already in use!";
    }

    const accessToken = await Helpers.SumUpAuth();

    let contactPreferences = {};

    if (req.body.behaviourChangeSurveyConsent == "on") {
      contactPreferences.behaviourChangeSurvey = true;
    }

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

    const memberId = await Members.add(sanitizedMember);
  
    let transactionSummary = {
      sumupCheckoutId: "",
      bill: [{ value: membershipCost, item_id: "membership" }],
      totals: { money: membershipCost },
      comment: "1 year of membership. Processed through website."
    };

    const transactionId = await Transactions.addTransaction({ till_id: "website", user_id: "website", member_id: member_id, date: new Date(), summary: transactionSummary });
  
    const checkoutId = await Helpers.SumUpCreateCheckout();
    transactionSummary.sumupCheckoutId = checkoutId;

    await Transactions.update({ summary: transactionSummary }, { where: { transaction_id: transactionId.toString() } });
    
    res.status(200);
    res.send({ memberId: memberId, checkoutId: checkoutId, murakamiTransactionId: transactionId });
  } catch (error) {
    if(typeof error != "string") {
      error = "Something went wrong!"
    }
    
    res.status(400);
    res.send({ msg: error });
  }
});

router.post("/verify-payment", Auth.verifyByKey("membershipSignUp"), async (req, res) => {
  try {
    const murakamiTransactionId = req.body.murakamiTransationId;
    const SumUpTransactionId = req.body.sumupTransactionId;

    const murakamiTransaction = await Transactions.getById(murakamiTransactionId);

    if(!(murakamiTransaction.till_id == "website" && murakamiTransaction.user_id == "website" && murakamiTransaction.summary.sumupCheckoutId == SumUpTransactionId) {
      throw "Not an online membership payment";
    }
    
    const accessToken = await Helpers.SumUpAuth();

    const SumUpTransaction = await Helpers.SumUpGetTransaction(SumUpTransactionId, accessToken);
    // Could be /transactions?id=
    
    if (SumUpTransaction.status != "PAID") {
      throw "Payment was not successful";
    }

    if(Number(SumUpTransaction.amount) != Number(murakamiTransaction.summary.totals.money)) {
      throw "Payment amount do not match";
    }

    if(){
    }
    //ids match

    // Update transaction with transaction id
    // Update membership status, extened expiration date,
    // Send welcome email

    res.status(200);
    res.send({});

  } catch (error) {
    if(typeof error != "string") {
      error = "Your payment could not be verified. You may have been charged - please contact support";
    }
  
    res.status(400);
    res.send({ msg: error });
  }
});

module.exports = router;
