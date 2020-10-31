// /till/donations

const router = require("express").Router();

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Tills = Models.Tills;
const Transactions = Models.Transactions;
const Members = Models.Members;

const Auth = require(rootDir + "/app/configs/auth");
const Mail = require(rootDir + "/app/configs/mail/root");

router.get("/:till_id", Auth.isLoggedIn, Auth.canAccessPage("tills", "processDonations"), async (req, res) => {
  try {
    const till = await Tills.getOpenTill(req.params.till_id);

    if (!(req.user.permissions.tills.processDonations == true || (req.user.permissions.tills.processDonations == "commonWorkingGroup" && req.user.working_groups.includes(till.group_id)))) {
      throw "You are not permitted to process donations on this till";
    }
    
    res.render("till/donations", {
      tillMode: true,
      title: "Process Donation",
      donationsActive: true,
      till: till
    });
  } catch (error) {
    if(typeof error != "string") {
      error = "Something went wrong! Please try again";
    }
    req.flash("error_msg", error);
    res.redirect(process.env.PUBLIC_ADDRESS + "/till/transaction/" + req.params.till_id);
  }
});

router.post("/", Auth.isLoggedIn, Auth.canAccessPage("tills", "processDonations"), async (req, res) => {
  try {
    const member_id = req.body.member_id;
    const till_id = req.body.till_id;
    const tokens = req.body.tokens;

    const till = await Tills.getOpenTill(till_id);

    if (!(req.user.permissions.tills.processDonations == true || (req.user.permissions.tills.processDonations == "commonWorkingGroup" && req.user.working_groups.includes(till.group_id)))) {
      throw "You are not permitted to process donations on this till";
    }
    
    if(!Number.isInteger(Number(tokens))) {
      throw "Please enter a whole number of tokens";
    }

    if (tokens < 1) {
      throw "Please enter at least 1 token";
    }

    if(tokens > 50) {
      throw "Please enter less than 50 tokens";
    }

    const member = await Members.getById(member_id, { permissions: { members: { name: true, contactDetails: true, balance: true, membershipDates: true } } });
    
    if(!member) {
      throw "Member not found!";
    }

    const newBalance = Number(member.balance) + Number(tokens); 
    await Members.updateBalance(member_id, newBalance);
    
    const formattedTransaction = {
      till_id: till_id,
      user_id: req.user.id,
      member_id: member_id,
      date: new Date(),
      summary: {
        totals: { tokens: tokens },
        bill: [{ item_id: "donation", tokens: tokens }]
      }
    };
 
    await Transactions.addTransaction(formattedTransaction);
    
    await Mail.sendAutomatedMember("donation", member.member_id, { tokens: tokens });
      
    res.send({
      status: "ok", 
      msg: "Tokens added and member notified!",
      member: {
        id: member.member_id,
        name: `${member.first_name} ${member.last_name}`,
        balance: newBalance,
        is_member: 1,
        membership_expires: member.current_exp_membership
      }
    });

  } catch (error) {
    if(typeof error != "string") {
      error = "Something went wrong! Please try again";
    }
    res.send({ status: "fail", msg: error })
  }
});

module.exports = router;
