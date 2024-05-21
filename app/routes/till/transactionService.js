const lodash = require("lodash");
const moment = require("moment");

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Helpers = require(rootDir + "/app/controllers/helper-functions/root");

const Tills = Models.Tills;
const Transactions = Models.Transactions;
const StockCategories = Models.StockCategories;
const StockRecords = Models.StockRecords;
const Members = Models.Members;
const Carbon = Models.Carbon;
const CarbonCategories = Models.CarbonCategories;

//helper functions
//TODO: Define:
// globalDiscountPercentage
// globalDiscountAbsolute
// quantities
// quantityError
// memberDiscountTokens
// carbonTransaction

//Probably want to entirely refactor this to have objects which provide context/ global variables and pass these back and forwards to the loops
//Make sure not to forget anything!
const sanitizeTransactionItem = ({
  item,
  totalMoney,
  totalTokens,
  totalWeight,
  giftcardValue,
  categories,
  carbonCategories,
  till,
  discountInfo,
  memberDiscountMoney,
  membershipBought,
}) => {
  const id = item.id;

  let sanitizedItem = {};

  if (item.id == "giftcard") {
    sanitizedItem.item_id = "giftcard";
    sanitizedItem.weight = null;
    sanitizedItem.value = Number(item.value);
    sanitizedItem.quantity = 1;
    sanitizedItem.dateGiftcardPurchased = item.dateGiftcardPurchased;
    sanitizedItem.condition = null;
    giftcardValue = sanitizedItem.value;
  } else {
    if (!categories[id]) {
      throw "Category not found";
    }

    let category = lodash.clone(categories[id]);

    if (category.active != 1) {
      throw "Category disabled";
    }

    if (category.discount == 1) {
      globalDiscountPercentage = category.value;
      sanitizedItem.item_id = category.item_id;
      sanitizedItem.discount = 1;
      sanitizedItem.value = category.value;
    } else if (category.discount == 2) {
      globalDiscountAbsolute = category.value;
      sanitizedItem.item_id = category.item_id;
      sanitizedItem.discount = 2;
      sanitizedItem.value = category.value;
    } else {
      const weight = Number(item.weight);
      let value = Number(item.value);
      let quantity = 1;
      let condition = null;

      if (category.value) {
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
              quantities[id][condition].max =
                category.stockInfo[condition].quantity;
            }
          }

          quantities[id][condition].quantity += quantity;
          if (
            quantities[id][condition].quantity > quantities[id][condition].max
          ) {
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
          memberDiscountTokens +=
            (category.member_discount / 100) * (value * quantity);
        }
      } else {
        totalMoney = Number(totalMoney) + Number(value * quantity);
        if (category.member_discount) {
          memberDiscountMoney +=
            (category.member_discount / 100) * (value * quantity);
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
          carbonTransaction[item.carbon_id] =
            Number(carbonTransaction[item.carbon_id]) +
            Number(weight * quantity);
        } else {
          carbonTransaction[group_id][item.carbon_id] = weight * quantity;
        }

        totalWeight = Number(totalWeight) + Number(weight * quantity);
      }

      sanitizedItem.item_id = category.item_id;
      sanitizedItem.weight = weight;
      sanitizedItem.value = value;
      sanitizedItem.quantity = quantity;
      sanitizedItem.condition = condition;
    }
    return {
      sanitizedItem: sanitizedItem,
      totalMoney,
      totalTokens,
      totalWeight,
      giftcardValue,
      membershipBought,
      memberDiscountMoney,
      discountInfo,
    };
  }
};

//API functions
async function getProcessTransaction({ till_id, user, query }) {
  try {
    let till = await Tills.getOpenTill(till_id);
    till.status = 1;

    if (
      !(
        user.permissions.tills.viewTill === true ||
        (user.permissions.tills.viewTill === "commonWorkingGroup" &&
          user.working_groups.includes(till.group_id))
      )
    ) {
      throw new Error(
        "You don't have permission to process transactions on this till"
      );
    }

    const group = user.allWorkingGroups[till.group_id];
    const categories = await StockCategories.getCategoriesByTillId(
      till_id,
      "tree"
    );

    let presetTransaction = null;
    if (query.transaction) {
      try {
        presetTransaction = JSON.parse(decodeURIComponent(query.transaction));
      } catch (error) {
        presetTransaction = null;
      }
    }

    return {
      tillMode: true,
      title: "Transaction",
      transactionsActive: true,
      till: till,
      allWorkingGroups: user.allWorkingGroups,
      working_group: group,
      categories: categories,
      diode_api_key: process.env.DIODE_API_KEY,
      sumup_affiliate_key: process.env.SUMUP_AFFILIATE_KEY,
      sumup_app_id: process.env.SUMUP_APP_ID,
      sumupCallback: query.sumupCallback || false,
      transactionSummary: query.transactionSummary || null,
      murakamiTransactionId: query.murakamiTransactionId || null,
      carbonSummary: query.carbonSummary || null,
      murakamiStatus: query.murakamiStatus || null,
      smpStatus: query["smp-status"] || null,
      smpMsg: query["smp-failure-cause"] || null,
      member_id: query.member_id || null,
      presetTransaction: presetTransaction,
    };
  } catch (error) {
    console.error(error);
    throw new Error("Something went wrong! Please try again");
  }
}

async function postProcessTransaction({
  till_id,
  member_id,
  paymentMethod,
  transaction,
  payWithTokens,
  note,
  user,
}) {
  {
    try {
      let membershipBought;
      let validTransaction = true;
      let whyTransactionFailed;

      const till = await Tills.getOpenTill(till_id);

      if (
        !(
          user.permissions.tills.processTransaction == true ||
          (user.permissions.tills.processTransaction == "commonWorkingGroup" &&
            user.working_groups.includes(till.group_id))
        )
      ) {
        throw "You don't have permission to process transactions on this till";
      }

      const carbonCategories = await CarbonCategories.getAll();
      const categories = await StockCategories.getCategoriesByTillId(
        till_id,
        "kv"
      );
      let sanitizedTransaction = [];
      let carbonTransaction = {};
      let quantities = {};
      let quantityError = false;

      let totalTokens = 0;
      let totalMoney = 0;
      let totalWeight = 0;
      let giftcardValue = 0;
      let giftcardBalance = 0;

      // Discounts
      let discountInfo = {}; // Contains IDs of items that have a members' discount
      let globalDiscountPercentage = 0; // Total *whole transaction* discount as a percentage
      let globalDiscountAbsolute = 0; // Total *whole transaction* discount as an asbolute (fixed) value

      let memberDiscountTokens = 0;
      let memberDiscountMoney = 0;

      for (const item of transaction) {
        let result = sanitizeTransactionItem({
          item,
          totalMoney,
          totalTokens,
          totalWeight,
          giftcardValue,
          categories,
          carbonCategories,
          till,
          discountInfo,
          membershipBought,
          memberDiscountMoney,
        });

        ({
          totalMoney,
          totalTokens,
          totalWeight,
          giftcardValue,
          membershipBought,
          discountInfo,
          memberDiscountMoney,
        } = result);
        sanitizedTransaction.push(result.sanitizedItem);
      }

      let formattedTransaction = {
        till_id: till_id,
        user_id: user.id,
        member_id: member_id || "anon",
        date: moment().toDate(),
        summary: {
          totals: {},
          bill: sanitizedTransaction,
          comment: note,
        },
      };

      const member = await Members.getById(member_id, {
        permissions: {
          members: { name: true, balance: true, membershipDates: true },
        },
      });

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

      if (giftcardValue > 0) {
        giftcardBalance = giftcardValue;
      }

      if (foundMember && (member.is_member == 1 || membershipBought)) {
        totalMoney = totalMoney - memberDiscountMoney;
        totalTokens = totalTokens - memberDiscountTokens;

        totalMoney -= totalMoney * (globalDiscountPercentage / 100);
        totalMoney -= globalDiscountAbsolute;

        if (totalMoney < 0) {
          totalMoney = 0;
        }

        if (totalMoney > giftcardValue) {
          giftcardBalance = 0;
        } else {
          giftcardBalance -= totalMoney;
        }

        totalMoney =
          totalMoney > giftcardValue ? totalMoney - giftcardValue : 0;

        totalTokens -= totalTokens * (globalDiscountPercentage / 100);
        totalTokens -= globalDiscountAbsolute;

        if (totalTokens > giftcardValue) {
          giftcardBalance = 0;
        } else {
          if (giftcardValue > 0) {
            giftcardBalance -= totalTokens;
          }
        }
        totalTokens =
          totalTokens > giftcardValue ? totalTokens - giftcardValue : 0;

        if (giftcardValue > 0) {
          totals.giftcard = giftcardValue;
        }

        if (
          giftcardBalance > 0 &&
          giftcardValue > 0 &&
          giftcardBalance < giftcardValue
        ) {
          const automaticDonation = {
            item_id: "donation",
            value: giftcardBalance,
          };
          formattedTransaction.summary.bill.push(automaticDonation);
        }

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
              money =
                Number(totalMoney) + Math.abs(member.balance - totalTokens);
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
        totals.money -= totals.money * (globalDiscountPercentage / 100); // Apply whole transaction percentage discount
        totals.money -= globalDiscountAbsolute; // Apply whole transaction absolute (fixed) discount

        if (totals.money > giftcardValue) {
          giftcardBalance = 0;
        } else {
          if (giftcardValue > 0) {
            giftcardBalance -= totals.money;
          }
        }

        totals.money =
          totals.money > giftcardValue ? totals.money - giftcardValue : 0;

        if (giftcardValue > 0) {
          totals.giftcard = giftcardValue;
        }

        if (
          giftcardBalance > 0 &&
          giftcardValue > 0 &&
          giftcardBalance < giftcardValue
        ) {
          const automaticDonation = {
            item_id: "donation",
            value: giftcardBalance,
          };
          formattedTransaction.summary.bill.push(automaticDonation);
        }

        if (totals.money == 0) {
          paymentMethod = null;
        }
      }

      console.log(totals);
      formattedTransaction.summary.totals = totals;
      formattedTransaction.summary.paymentMethod = paymentMethod;

      if (
        formattedTransaction.summary.totals.money < 1 &&
        paymentMethod == "card"
      ) {
        validTransaction = false;
        whyTransactionFailed = "To pay by card, please spend at least £1.00";
      }

      if (membershipBought && formattedTransaction.member_id == "anon") {
        validTransaction = false;
        whyTransactionFailed = `A member must be selected to purchase a membership. To add a member, please go to the <a href="${process.env.PUBLIC_ADDRESS}/members/add?till_id=${till.till_id}">add member page</a>.`;
      }

      // Transaction must contain at least one "real" item (i.e. not a discount)
      if (
        formattedTransaction.summary.bill.filter(function (item) {
          return !item.discount && !item.giftcard;
        }).length == 0
      ) {
        validTransaction = false;
        whyTransactionFailed =
          "There must be at least one item in the transaction.";
      }

      if (
        !formattedTransaction.summary.paymentMethod &&
        formattedTransaction.summary.totals.money > 0
      ) {
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

      await StockCategories.bulkUpdateQuantities(
        StockRecords,
        user.id,
        till.till_id,
        categories,
        quantities
      );

      const transactionId = await Transactions.addTransaction(
        formattedTransaction
      );

      let response = {
        status: "ok",
        transactionSummary: "",
        carbonSummary: "",
        transaction_id: transactionId,
      };

      if (formattedTransaction.summary.totals.money > 0) {
        formattedTransaction.summary.paymentMethod = paymentMethod;
        response.transactionSummary +=
          " £" + formattedTransaction.summary.totals.money;
        if (formattedTransaction.summary.totals.tokens > 0) {
          response.transactionSummary += " and";
        }
      }

      if (formattedTransaction.summary.totals.tokens > 0) {
        response.transactionSummary +=
          " " + formattedTransaction.summary.totals.tokens + " tokens";
      }

      if (
        !formattedTransaction.summary.totals.tokens &&
        !formattedTransaction.summary.totals.money
      ) {
        response.transactionSummary += " Nothing";
      }

      response.transactionSummary += " paid";

      if (foundMember) {
        if (formattedTransaction.summary.totals.tokens > 0) {
          member.balance =
            member.balance - formattedTransaction.summary.totals.tokens;
        }

        if (membershipBought) {
          if (member.membership_type == "unpaid") {
            await Members.update(
              { membership_type: null },
              { where: { member_id: member_id } }
            );
          }
        } else {
          await Members.updateBalance(member_id, member.balance);
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
              paymentMethod: null,
            },
          };

          await Transactions.addTransaction(membershipTokensTransaction);
          await Members.updateBalance(member_id, (member.balance || 0) + 5);

          response.transactionSummary += " 12 months of membership issued.";
        } else if (membershipBought == "MEM-HY") {
          await Members.renew(member_id, "half_year");

          response.transactionSummary += " 6 months of membership issued.";
        }
      }

      formattedTransaction.summary.totals.money =
        formattedTransaction.summary.totals.money || 0;

      let simpleCarbon = [];

      for await (const groupId of Object.keys(carbonTransaction)) {
        const transObj = carbonTransaction[groupId];
        let carbon = {
          member_id: member_id || "anon",
          user_id: user.id,
          trans_object: transObj,
          fx_transaction_id: transactionId,
          group_id: groupId,
          method: "reused",
        };

        await Carbon.add(carbon);
        simpleCarbon.push({ trans_object: transObj, method: "reused" });
      }

      const carbonSaved = await Helpers.calculateCarbon(
        simpleCarbon,
        carbonCategories
      );

      response.carbonSummary =
        Math.abs((carbonSaved * 1e-3).toFixed(2)) + "kg of carbon saved";

      if (paymentMethod == "card") {
        const sumupCallbackUri = `${process.env.PUBLIC_ADDRESS}/api/get/tills/smp-callback/?murakamiStatus=${response.status}&transactionSummary=${response.transactionSummary}&carbonSummary=${response.carbonSummary}&till_id=${till.till_id}`;
        //https://github.com/sumup/sumup-ios-url-scheme/blob/master/README.md

        let sumupSummon = `sumupmerchant://pay/1.0?affiliate-key=${
          process.env.SUMUP_AFFILIATE_KEY
        }&app-id=${process.env.SUMUP_APP_ID}&title=${
          user.allWorkingGroupsObj[till.group_id].name
        } purchase&total=${formattedTransaction.summary.totals.money}&amount=${
          formattedTransaction.summary.totals.money
        }&currency=GBP&foreign-tx-id=${transactionId}&skipSuccessScreen=${
          process.env.DISABLE_SUMUP_RECEIPTS
        }&callback=${encodeURIComponent(sumupCallbackUri)}`;

        if (member) {
          if (member.email) {
            sumupSummon += "&receipt-email=" + member.email;
          }
          if (member.phone_no) {
            sumupSummon += "&receipt-mobilephone=" + member.phone_no;
          }
        }

        if (response.status == "ok") {
          return { status: "redirect", url: sumupSummon };
        } else {
          return response;
        }
      } else {
        return response;
      }
    } catch (error) {
      console.log(error);
      if (typeof error != "string") {
        error = "Something went wrong! Please try again";
      }
      return { status: "fail", message: error };
    }
  }
}
module.exports = { getProcessTransaction, postProcessTransaction };
