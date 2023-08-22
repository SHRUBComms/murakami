// /till/return-yoyo-cup

const router = require("express").Router();

const moment = require("moment");
moment.locale("en-gb");

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Tills = Models.Tills;
const Members = Models.Members;
const Transactions = Models.Transactions;

const Auth = require(rootDir + "/app/controllers/auth");

router.get("/:till_id", Auth.isLoggedIn, Auth.canAccessPage("tills", "processTransaction"), async (req, res) => {
  try {
    const till = await Tills.getOpenTill(req.params.till_id);

    if (!(req.user.permissions.tills.processTransaction == true || (req.user.permissions.tills.processTransaction == "commonWorkingGroup" && req.user.working_groups.includes(till.group_id)))) {
      throw "You don't have permission to process transactions on this till";
    }

    res.render("till/return-yoyo-cup", {
      tillMode: true,
      title: "Return Yoyo Cup",
      returnYoyoCupActive: true,
      till: till
    });
  } catch (error) {
    if(typeof error != "string") {
      error = "Something went wrong! Please try again";
    }
    req.flash("error_msg", error);
    res.redirect(process.env.PUBLIC_ADDRESS + "/till/dashboard/" + req.params.till_id);
  }
});

router.post("/:till_id", Auth.isLoggedIn, Auth.canAccessPage("tills", "processTransaction"), async (req, res) => { 
  const cupValue = 4;
  
  try {
    const till = await Tills.getOpenTill(req.params.till_id);

    if (!(req.user.permissions.tills.processTransaction == true || (req.user.permissions.tills.processTransaction == "commonWorkingGroup" && req.user.working_groups.includes(till.group_id)))) {
      throw "You don't have permission to process transactions on this till";
    }

    let member_id = "anon";

    if(req.body.member_id != "") {
      const member = await Members.getById(req.body.member_id, { permissions: { members: { name: true } } });
      if(!member) {
        throw "Member not found!";
      }
      member_id = member.member_id;
    }

    let cups = req.body.cups;
    if(isNaN(cups)) {
      throw "Please enter a valid number of cups."
    }

    cups = Math.floor(cups);

    if(cups < 1 || cups > 50) {
      throw "Please enter a valid number of cups (between 1 and 50)."
    }

    const totalDue = Number(cups * cupValue);

    let formattedTransaction = {
      member_id: member_id,
      till_id: till.till_id,
      user_id: req.user.id,
      date: moment().toDate(),
      summary: {}
    }

    formattedTransaction.summary = {
     bill:[
        {
           value: cupValue,
           weight: 0,
           item_id: "yoyoCup",
           quantity: cups,
           condition: null
        }
     ],
     totals:{
        money: (totalDue).toFixed(2)
     },
     comment:"Cash reimbursement for returning Yoyo reusable cup(s).",
     discount_info: {},
     paymentMethod: "cash"
    };

    await Transactions.addTransaction(formattedTransaction);

    req.flash("success_msg", "Yoyo cup(s) returned successfully!");
    res.redirect(process.env.PUBLIC_ADDRESS + "/till/transaction/" + req.params.till_id);

  } catch (error) {
    console.error(error);
    if(typeof error != "string") {
      error = "Something went wrong! Please try again";
    }
    req.flash("error_msg", error);
    res.redirect(process.env.PUBLIC_ADDRESS + "/till/transaction/" + req.params.till_id);
  }
});

module.exports = router;
