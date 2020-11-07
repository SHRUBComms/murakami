// /till/transaction

const router = require("express").Router();
const lodash = require("lodash");
const moment = require("moment");
moment.locale("en-gb");

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Tills = Models.Tills;
const Transactions = Models.Transactions;
const StockCategories = Models.StockCategories;
const StockRecords = Models.StockRecords;
const Members = Models.Members;
const Carbon = Models.Carbon;
const CarbonCategories = Models.CarbonCategories;

const Auth = require(rootDir + "/app/controllers/auth");
const Helpers = require(rootDir + "/app/controllers/helper-functions/root");

router.get("/:till_id", Auth.isLoggedIn, Auth.canAccessPage("tills", "processTransaction"), async (req, res) => {
  try {
    let till = await Tills.getOpenTill(req.params.till_id);
    till.status = 1;
    
    if (!(req.user.permissions.tills.viewTill == true || (req.user.permissions.tills.viewTill == "commonWorkingGroup" && req.user.working_groups.includes(till.group_id)))) {
      throw "You don't have permission to process transactions on this till";
    }
    
    const group = req.user.allWorkingGroups[till.group_id];
    const categories = await StockCategories.getCategoriesByTillId(req.params.till_id, "tree");
    
    let presetTransaction;
    if (req.query.transaction) {
      try {
        presetTransaction = JSON.parse(decodeURIComponent(req.query.transaction));
      } catch (error) {
        presetTransaction = null;
      }
    }

    res.render("till/root", {
      tillMode: true,
      title: "Transaction",
      transactionsActive: true,
      till: till,
      allWorkingGroups: req.user.allWorkingGroups,
      working_group: group,
      categories: categories,
      diode_api_key: process.env.DIODE_API_KEY,
      sumup_affiliate_key: process.env.SUMUP_AFFILIATE_KEY,
      sumup_app_id: process.env.SUMUP_APP_ID,

      sumupCallback: req.query.sumupCallback || false,
      transactionSummary: req.query.transactionSummary || null,
      murakamiTransactionId: req.query.murakamiTransactionId || null,
      carbonSummary: req.query.carbonSummary || null,
      murakamiStatus: req.query.murakamiStatus || null,
      smpStatus: req.query["smp-status"] || null,
      smpMsg: req.query["smp-failure-cause"] || null,

      member_id: req.query.member_id || null,
      presetTransaction: presetTransaction
    });
  } catch (error) {
    console.log(error);
    if(typeof error != "string") {
      error = "Something went wrong! Please try again";
    }

    req.flash("error_msg", error);
    res.redirect(process.env.PUBLIC_ADDRESS + "/till/select");
  }    
});

router.post("/", Auth.isLoggedIn, Auth.canAccessPage("tills", "processTransaction"), async (req, res) => {
  try {
    const till_id = req.body.till_id;
    const member_id = req.body.member_id;
    let paymentMethod = req.body.paymentMethod;
    const transaction = req.body.transaction;
    const payWithTokens = JSON.parse(req.body.payWithTokens) || false;
    const note = req.body.note;

    let membershipBought;
    let validTransaction = true;
    let whyTransactionFailed;

    const till = await Tills.getOpenTill(till_id);
    
    if (!(req.user.permissions.tills.processTransaction == true || (req.user.permissions.tills.processTransaction == "commonWorkingGroup" && req.user.working_groups.includes(till.group_id)))) {
      throw "You don't have permission to process transactions on this till";
    }
    
    const carbonCategories = await CarbonCategories.getAll();
    const categories = await StockCategories.getCategoriesByTillId(till_id, "kv");
    let sanitizedTransaction = [];
    let carbonTransaction = {};
    let quantities = {};
    let quantityError = false;

    let totalTokens = 0;
    let totalMoney = 0;
    let totalWeight = 0;
    let memberDiscountTokens = 0;
    let memberDiscountMoney = 0;
    let discountInfo = {};

    for await (const item of transaction) {
      const id = item.id;
      
      if(!categories[id]) {
        throw "Category not found"
      }

      let category = lodash.clone(categories[id]);

      if(category.active != 1) {
        throw "Category disabled";
      }
      
      const weight = Number(item.weight);
      let value = Number(item.value);
      let quantity = 1;
      let condition = null;

      if(category.value) {
        value = Number(category.value);
      }

      if (category.stockControl == 1 && category.conditions != null) {
        if (category.conditions.length == 1) {
          condition = category.conditions[0];
        } else if (category.conditions.includes(item.condition)) {
          condition = item.condition;
        } else {
          throw "No valid condition selected";
        }
      }
      
      if (item.quantity > 1 && !isNaN(item.quantity)) {
        quantity = parseInt(item.quantity);
      }

      if (category.stockControl == 1) {
        if (!quantities[id]) {
          quantities[id] = { max: 0, quantity: 0 };
        }

        if (!quantities[id][condition]) {
          quantities[id][condition] = { max: 0, quantity: 0 };
        }
        
        if (!condition) {
          if (category.stockInfo.quantity) {
            quantities[id].max = category.stockInfo.quantity;
          }

          quantities[id].quantity += quantity;
          if (quantities[id].quantity > quantities[id].max) {
            quantityError = true;
          }

        } else {
          if (category.stockInfo[condition]) {
            if (category.stockInfo[condition].quantity) {
              quantities[id][condition].max = category.stockInfo[condition].quantity;
            }
          }

          quantities[id][condition].quantity += quantity;
          if (quantities[id][condition].quantity > quantities[id][condition].max) {
            quantityError = true;
          }
        }
      }

      if (category.action) {
        if (category.action.substring(0, 3) == "MEM") {
          membershipBought = category.action;
        }
      }

      if (category.member_discount) {
        discountInfo[id] = category.member_discount;
      }

      if (category.allowTokens == 1) {
        totalTokens = Number(totalTokens) + Number(value * quantity);
        if (category.member_discount) {
          memberDiscountTokens += (category.member_discount / 100) * (value * quantity);
        }
      } else {
        totalMoney = Number(totalMoney) + Number(value * quantity);
        if (category.member_discount) {
          memberDiscountMoney += (category.member_discount / 100) * (value * quantity) ;
        }
      }

      if (category.carbon_id) {
        item.carbon_id = category.carbon_id;
      }

      let group_id = category.group_id || till.group_id;

      if (weight > 0 && carbonCategories[item.carbon_id]) {
        if (!carbonTransaction[group_id]) {
          carbonTransaction[group_id] = {};
        }

        if (carbonTransaction[group_id][item.carbon_id]) {
          carbonTransaction[item.carbon_id] = Number(carbonTransaction[item.carbon_id]) + Number(weight * quantity);
        } else {
          carbonTransaction[group_id][item.carbon_id] = weight * quantity;
        }
        
        totalWeight = Number(totalWeight) + Number(weight * quantity);
      }

      let sanitizedItem = {};
      sanitizedItem.item_id = category.item_id;
      sanitizedItem.weight = weight;
      sanitizedItem.value = value;
      sanitizedItem.quantity = quantity;
      sanitizedItem.condition = condition;
      
      sanitizedTransaction.push(sanitizedItem);
    }

    let formattedTransaction = {
      till_id: till_id,
      user_id: req.user.id,
      member_id: member_id || "anon",
      date: moment().toDate(),
      summary: {
        totals: {},
        bill: sanitizedTransaction,
        comment: note
      }
    };

    const member = await Members.getById(member_id, { permissions: { members: { name: true, balance: true, membershipDates: true } } });
                            
    let foundMember = false;
    let anonTransaction = false;

    if (member && member_id) {
      foundMember = true;
    } else if (formattedTransaction.member_id == "anon") {
      anonTransaction = true;
    }

    if (!foundMember && !anonTransaction) {
      throw "Member not found!";
    }
                              
    let totals = {};

    if (foundMember && (member.is_member == 1 || membershipBought)) {
      totalMoney = totalMoney - memberDiscountMoney;
      totalTokens = totalTokens - memberDiscountTokens;

      formattedTransaction.summary.discount_info = discountInfo;

      if (payWithTokens == true) {
        if (totalMoney == 0) {
          if (member.balance >= totalTokens) {
            totals.tokens = Math.ceil(totalTokens);
          } else {
            let difference = totalTokens - member.balance;
            totals.money = difference.toFixed(2);
            totals.tokens = totalTokens - difference;
          }
        } else {
          let money = 0;
          let tokens = 0;
          if (member.balance - totalTokens >= 0) {
            tokens = totalTokens;
            money = totalMoney;
          } else {
            tokens = member.balance;
            money = Number(totalMoney) + Math.abs(member.balance - totalTokens);
          }

          totals.money = money.toFixed(2);
          totals.tokens = Math.ceil(tokens);
        }
      } else {
        totals.money = (Number(totalTokens) + Number(totalMoney)).toFixed(2);
      }

      if (totals.money == 0 && totals.tokens == 0) {
        paymentMethod = null;
      }
    } else {
      totals.money = (Number(totalTokens) + Number(totalMoney)).toFixed(2);
      formattedTransaction.summary.totals = totals;

      if (totals.money == 0) {
        paymentMethod = null;
      }
    }

    formattedTransaction.summary.totals = totals;
    formattedTransaction.summary.paymentMethod = paymentMethod;

    if (formattedTransaction.summary.totals.money < 1 && paymentMethod == "card") {
      validTransaction = false;
      whyTransactionFailed = "To pay by card, please spend at least £1.00";
    }

    if (membershipBought && formattedTransaction.member_id == "anon") {
      validTransaction = false;
      whyTransactionFailed = `A member must be selected to purchase a membership. To add a member, please go to the <a href="${process.env.PUBLIC_ADDRESS}/members/add?till_id=${till.till_id}">add member page</a>.`;
    }

    if (formattedTransaction.summary.bill.length == 0) {
      validTransaction = false;
      whyTransactionFailed = "There must be at least one item in the transaction.";
    }

    if (!formattedTransaction.summary.paymentMethod && formattedTransaction.summary.totals.money > 0) {
      validTransaction = false;
      whyTransactionFailed = "Please specify a payment method.";
    }

    if (quantityError) {
      validTransaction = false;
      whyTransactionFailed = "Quantities exceeded stock.";
    }

    if (!validTransaction) {
      throw whyTransactionFailed;
    }
    
    await StockCategories.bulkUpdateQuantities(StockRecords, req.user.id, till.till_id, categories, quantities);
                                
    const transactionId = await Transactions.addTransaction(formattedTransaction);
    
    let response = {
      status: "ok",
      transactionSummary: "",
      carbonSummary: "",
      transaction_id: transactionId
    };

    if (formattedTransaction.summary.totals.money > 0) {
      formattedTransaction.summary.paymentMethod = paymentMethod;
      response.transactionSummary += " £" + formattedTransaction.summary.totals.money;
      if (formattedTransaction.summary.totals.tokens > 0) {
        response.transactionSummary += " and";
      }
    }

    if (formattedTransaction.summary.totals.tokens > 0) {
      response.transactionSummary += " " + formattedTransaction.summary.totals.tokens + " tokens";
    }

    if (!formattedTransaction.summary.totals.tokens && !formattedTransaction.summary.totals.money) {
      response.transactionSummary += " Nothing";
    }

    response.transactionSummary += " paid";

    if (foundMember) {
      if (formattedTransaction.summary.totals.tokens > 0) {
        member.balance = member.balance - formattedTransaction.summary.totals.tokens;
      }

      if (membershipBought) {
        if (member.membership_type == "unpaid") {
          await Members.update({ membership_type: null }, { where: { member_id: member_id } });
        }
      }

      if (membershipBought == "MEM-FY") {
        await Members.renew(member_id, "full_year");

        const membershipTokensTransaction = {
          member_id: member_id,
          till_id: till.till_id,
          user_id: "automatic",
          date: moment().add(1, "seconds"),
          summary: {
            totals: { tokens: 5 },
            bill: [{ tokens: "5", item_id: "membership" }],
            comment: "",
            paymentMethod: null
          }
        }

        await Transactions.addTransaction(membershipTokensTransaction);
        await Members.updateBalance(member_id, (member.balance || 0) + 5);

        response.transactionSummary += " 12 months of membership issued.";
      } else if (membershipBought == "MEM-HY") {
        await Members.renew(member_id, "half_year");

        response.transactionSummary += " 6 months of membership issued.";
      }
    }

    formattedTransaction.summary.totals.money = formattedTransaction.summary.totals.money || 0;

    if (foundMember) {
      await Members.updateBalance(member_id, member.balance);
    }
    
    let simpleCarbon = [];

    for await (const groupId of Object.keys(carbonTransaction)) {
      const transObj = carbonTransaction[groupId];
      let carbon = {
        member_id: member_id || "anon",
        user_id: req.user.id,
        trans_object: transObj,
        fx_transaction_id: transactionId,
        group_id: groupId,
        method: "reused"
      };
      
      await Carbon.add(carbon);
      simpleCarbon.push({ trans_object: transObj, method: "reused" });
    }

    const carbonSaved = await Helpers.calculateCarbon(simpleCarbon, carbonCategories);
    
    response.carbonSummary = Math.abs((carbonSaved * 1e-3).toFixed(2)) + "kg of carbon saved";

    if (paymentMethod == "card") {

      const sumupCallbackUri = `${process.env.PUBLIC_ADDRESS}/api/get/tills/smp-callback/?murakamiStatus=${response.status}&transactionSummary=${response.transactionSummary}&carbonSummary=${response.carbonSummary}&till_id=${till.till_id}`;

      let sumupSummon = `sumupmerchant://pay/1.0?affiliate-key=${process.env.SUMUP_AFFILIATE_KEY}&app-id=${process.env.SUMUP_APP_ID}&title=${req.user.allWorkingGroupsObj[till.group_id].name} purchase&total= ${totals.money}&amount=${totals.money}&currency=GBP&foreign-tx-id=${transactionId}&skipSuccessScreen=${process.env.DISABLE_SUMUP_RECEIPTS}&callback=${encodeURIComponent(sumupCallbackUri)}`;
 
      if (member) {
        if (member.email) {
          sumupSummon += "&receipt-email=" + member.email;
        }

        if (member.phone_no) {
          sumupSummon += "&receipt-mobilephone=" + member.phone_no;
        }
      }

      if (response.status == "ok") {
        res.send({ status: "redirect", url: sumupSummon });
      } else {
        res.send(response);
      }
    } else {
      res.send(response);
    }
  } catch (error) {
    
    console.log(error);
    if(typeof error != "string") {
      error = "Something went wrong! Please try again";
    }
    res.send({ status: "fail", msg: error });
  }
});

module.exports = router;
