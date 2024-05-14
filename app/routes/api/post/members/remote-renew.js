// /api/post/members/remote-renew

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
const Helpers = require(rootDir + "/app/controllers/helper-functions/root");

router.post("/request-link", Auth.verifyByKey("membershipSignUp"), async (req, res) => {
  try {
    const email = req.body.email;
    if(!email) {
      throw "Please enter your email address";
    }

    const member = await Members.getByEmail(email);
    if(!member) {
      throw "no-member";
    }

    await Mail.sendAutomatedMember("renewal-link-request", member.member_id);

    res.status(200);
    res.send();

  } catch (error) {
    if(error == "no-member") {
      res.status(200);
      res.send();
    } else {
      if(typeof error != "string") {
        error = "Something went wrong! Please try again";
      } 

      res.status(400);
      res.send({ error });
    }
  }
});

router.post("/create-checkout", Auth.verifyByKey("membershipSignUp"), async (req, res) => {
  try {
    console.log("Creating SumUp checkout...");
    const member_id = req.body.member_id;
    const membershipLength = req.body.membershipLength;
    let membershipCost = req.body.membershipCost;
    const membershipLengthPlain = (membershipLength == "full-year") ? "Full" : "Half";
    const membershipItemId = (membershipLength == "full-year") ? "v8H4GDSvQ5" : "pdN6RMaP6S";
    const transactionComment = `${membershipLengthPlain} year of membership, via website.`;

    console.log(req.body);

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

    const member = await Members.getById(member_id, { permissions: { members: { membershipDates: true }}});

    if(!member) {
      throw "Couldn't find your membership";
    }

    console.log("Member found!");

    console.log("Access token generated: " + accessToken);

    const murakamiTransaction = {
      till_id: "website",
      user_id: "website",
      member_id: member.member_id,
      date: new Date(),
      summary: {
        bill: [{ value: membershipCost, weight: 0, item_id: membershipItemId, quantity: 1, condition: null }], 
        totals: { money: membershipCost }, paymentMethod: "card",
        comment: transactionComment
      } 
    }

    const murakamiTransactionId = await Transactions.addTransaction(murakamiTransaction);

    console.log("Local transaction recorded");

    res.status(200);
    res.send({ murakami: { transaction_id: murakamiTransactionId }});

  } catch (error) {
    console.log(error);

    if(typeof error != "string") {
      error = "Something went wrong! Please try again";
    }

    res.status(400);
    res.send({ error });
  }
});


router.post("/verify-renewal", Auth.verifyByKey("membershipSignUp"), async (req, res) => {
  try {
    console.log("Verifying membership payment...");
    const SumUpTransactionId = req.body.SumUpTransactionId;
    const murakamiTransactionId = req.body.murakamiTransactionId;
    
    console.log(req.body);

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

    console.log("Local transaction found");

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
    
    console.log("Got access token: " + accessToken);

    // Fetch SumUp transaction by SumUp ID and Murakami ID - verify that they match
    const SumUpTransaction = await Helpers.SumUpGetTransaction(SumUpTransactionId, accessToken);

    if(!SumUpTransaction) {
      throw "Something went wrong processing your payment";
    }

    console.log("SumUp transaction found: " + SumUpTransactionId);

    if (SumUpTransaction.status != "SUCCESSFUL") {
      throw "Payment was not successful";
    }

    console.log("SumUp transaction was successful");

    // Verify amounts match
    if(Number(SumUpTransaction.amount) != Number(murakamiTransaction.summary.totals.money)) {
      throw "Payment amount do not match";
    }

    console.log("Payment amounts match between local and SumUp records");

    // Verify dates match
    if(moment(murakamiTransaction.date).format("L") != moment(SumUpTransaction.timestamp).format("L")) {
      throw "Transaction dates do not match";
    }

    console.log("Transaction dates match");

    // Verify SumUp transaction ID isn't already in system
    const sumupIdAlreadyUsed = await Transactions.getBySumUpId(SumUpTransaction.transaction_code);

    if(sumupIdAlreadyUsed) {
      throw "SumUp transaction is already in system";
    }

    console.log("SumUp transaction ID is unique");

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
    
    console.log("Transaction contains a membership");

    await Members.update({ current_init_membership: today, current_exp_membership: newExpirationDate, is_member: 1 }, { where: { member_id: murakamiTransaction.member_id } });

    console.log("Member details updated");

    // Update transaction summary
    let updatedSummary = murakamiTransaction.summary;
    updatedSummary.sumupId = SumUpTransaction.transaction_code;
    await Transactions.update({ summary: updatedSummary }, { where: { transaction_id: murakamiTransactionId }});
    
    console.log("Local transacton updated - foregin payment verified");

    Mail.sendAutomatedMember("paid-renewal", murakamiTransaction.member_id);

    console.log("Confirmation email sent");
    
    res.status(200);
    res.send();

  } catch (error) {
    console.log(error);
    if(typeof error != "string") {
      error = "Something went wrong! Please try again";
    } 

    res.status(400);
    res.send({ error });
  }
});

module.exports = router;
