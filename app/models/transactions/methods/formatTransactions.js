const lodash = require("lodash");
const moment = require("moment");
moment.locale("en-gb");

module.exports = () => {
  return async (transactions, members, categories, till_id) => {
    const formattedTransactions = [];

    for await (const transaction of transactions) {
      const formattedTransaction = {};

      formattedTransaction.date = moment(transaction.date);
      formattedTransaction.date = moment(formattedTransaction.date).format("D/M/YY hh:mm A");

      formattedTransaction.customer = {};

      formattedTransaction.till_name = transaction.till_name;

      if (transaction.member_id != "anon") {
        formattedTransaction.customer.id = transaction.member_id;
        if (members[transaction.member_id]) {
          const memberPageLink =
            process.env.PUBLIC_ADDRESS +
            "/members/view/" +
            transaction.member_id +
            "?till_id=" +
            till_id;
          formattedTransaction.customer.name = `${members[transaction.member_id].first_name} ${members[transaction.member_id].last_name} <br />(<a href="${memberPageLink}" target="_blank">${formattedTransaction.customer.id}</a>)`;
        } else {
          formattedTransaction.customer.name =
            "Member (<a href='/members/view/" +
            formattedTransaction.customer.id +
            "?till_id=" +
            till_id +
            "' target='_blank'>view profile</a>)";
        }
      } else {
        formattedTransaction.customer.name = "Non-member";
      }

      formattedTransaction.totals = {};

      // Plain text totals.
      if (transaction.summary.paymentMethod == "cash") {
        formattedTransaction.totals.card = "0.00";
        if (!isNaN(transaction.summary.totals.money)) {
          formattedTransaction.totals.cash = Number(transaction.summary.totals.money).toFixed(2);
        } else {
          formattedTransaction.totals.cash = "0.00";
        }
      }

      if (transaction.summary.paymentMethod == "card") {
        if (!isNaN(transaction.summary.totals.money)) {
          formattedTransaction.totals.card = Number(transaction.summary.totals.money).toFixed(2);
        } else {
          formattedTransaction.totals.card = "0.00";
        }
        formattedTransaction.totals.cash = "0.00";
      }

      if (transaction.summary.totals) {
        formattedTransaction.totals.tokens = transaction.summary.totals.tokens || 0;
        formattedTransaction.totals.giftcard = transaction.summary.totals.giftcard || 0;
      } else {
        formattedTransaction.totals.tokens = 0;
        formattedTransaction.totals.giftcard = 0;
      }

      formattedTransaction.totals.money = "";
      if (transaction.summary.bill[0].item_id == "refund") {
        formattedTransaction.totals.money = "-";
      }

      if (!isNaN(transaction.summary.totals.money)) {
        formattedTransaction.totals.money +=
          "£" + (Number(transaction.summary.totals.money).toFixed(2) || "0.00");
      } else {
        formattedTransaction.totals.money += "£0.00";
      }

      if (transaction.summary.totals.giftcard > 0) {
        formattedTransaction.totals.giftcard =
          "£" + (Number(transaction.summary.totals.giftcard).toFixed(2) || "0.00");
        formattedTransaction.totals.giftcardPlain =
          Number(transaction.summary.totals.giftcard).toFixed(2) || null;
      } else {
        formattedTransaction.totals.giftcard = "£0.00";
      }

      formattedTransaction.paymentMethod = transaction.summary.paymentMethod || "";

      if (formattedTransaction.paymentMethod) {
        formattedTransaction.totals.money +=
          " (" + lodash.startCase(lodash.toLower(formattedTransaction.paymentMethod)) + ")";
      }

      if (!isNaN(transaction.summary.totals.money)) {
        formattedTransaction.totals.moneyPlain = Number(transaction.summary.totals.money).toFixed(
          2
        );
      } else {
        formattedTransaction.totals.moneyPlain = "0.00";
      }

      formattedTransaction.billArray = [];

      let bill = "";

      if (
        transaction.summary.paymentMethod == "card" &&
        !transaction.summary.sumupId &&
        !transaction.summary.refundedTransactionId
      ) {
        bill = "<p class='text-danger font-weight-bold'>Payment failed!</p>";
      }

      for (let i = 0; i < transaction.summary.bill.length; i++) {
        if (transaction.summary.bill[i].item_id == "donation") {
          if (transaction.summary.bill[i].tokens) {
            bill += "Donation: " + transaction.summary.bill[i].tokens;
            formattedTransaction.billArray.push({
              item: "Tokens added for donation",
              value: transaction.summary.bill[i].tokens,
            });
          } else if (transaction.summary.bill[i].value) {
            bill += "Donation: £" + Number(transaction.summary.bill[i].value).toFixed(2);
            formattedTransaction.billArray.push({
              item: "Donation",
              value: Number(transaction.summary.bill[i].value).toFixed(2),
            });
          }
        } else if (transaction.summary.bill[i].item_id == "volunteering") {
          bill += "Tokens added for volunteering: " + transaction.summary.bill[i].tokens;
          formattedTransaction.billArray.push({
            item: "Tokens added for volunteering",
            value: transaction.summary.bill[i].tokens,
          });
        } else if (transaction.summary.bill[i].item_id == "membership") {
          bill +=
            "Tokens added for buying a 12 month membership: " + transaction.summary.bill[i].tokens;
          formattedTransaction.billArray.push({
            item: "Tokens added for buying a 12 month membership",
            value: transaction.summary.bill[i].tokens,
          });
        } else if (transaction.summary.bill[i].item_id == "refund") {
          bill +=
            "<b>Outgoing</b><br />" +
            "Refund: -" +
            Number(transaction.summary.bill[i].value).toFixed(2);
          formattedTransaction.billArray.push({
            item: "Refund",
            value: Number(transaction.summary.bill[i].value).toFixed(2),
          });
        } else if (transaction.summary.bill[i].discount == 1) {
          bill +=
            categories[transaction.summary.bill[i].item_id].name +
            " (Discount): <span style='color: #1986e6;'>" +
            categories[transaction.summary.bill[i].item_id].value +
            "%</span>";
          formattedTransaction.billArray.push({
            item: "Discount",
            value: Number(transaction.summary.bill[i].value).toFixed(2),
            discountType: 1,
          });
        } else if (transaction.summary.bill[i].discount == 2) {
          bill +=
            categories[transaction.summary.bill[i].item_id].name +
            " (Discount): <span style='color: #1986e6;'>£" +
            Number(categories[transaction.summary.bill[i].item_id].value).toFixed(2) +
            "</span>";
          formattedTransaction.billArray.push({
            item: "Discount",
            value: Number(transaction.summary.bill[i].value).toFixed(2),
            discountType: 2,
          });
        } else if (transaction.summary.bill[i].item_id == "giftcard") {
          bill +=
            "Giftcard: <span style='color: #1986e6;'>£" +
            Number(transaction.summary.bill[i].value).toFixed(2) +
            " Balance</span>";
          formattedTransaction.billArray.push({
            item: "Giftcard",
            value: Number(transaction.summary.bill[i].value).toFixed(2),
          });
        } else if (transaction.summary.bill[i].item_id == "yoyoCup") {
          bill +=
            "Yoyo Reusable Cup: <span style='color: red;'>-£" +
            Number(transaction.summary.bill[i].value).toFixed(2) +
            "</span>";
          formattedTransaction.billArray.push({
            item: "Yoyo Reusable Cup",
            value: Number(transaction.summary.bill[i].value).toFixed(2),
          });
        } else {
          let value = transaction.summary.bill[i].tokens || transaction.summary.bill[i].value;

          // Format members' discount (item by item basis)
          let discount;
          if (transaction.summary.discount_info) {
            if (transaction.summary.discount_info[transaction.summary.bill[i].item_id]) {
              discount = transaction.summary.discount_info[transaction.summary.bill[i].item_id];
              value = value - value * (discount / 100);
            }
          }

          const billObject = { value: Number(value).toFixed(2) };

          if (categories[transaction.summary.bill[i].item_id]) {
            bill += categories[transaction.summary.bill[i].item_id].absolute_name;
            billObject.item = categories[transaction.summary.bill[i].item_id].absolute_name;
          } else {
            bill += "Unknown Item";
            billObject.item = "Unkown Item";
          }

          if (transaction.summary.bill[i].condition) {
            bill += " (" + lodash.startCase(transaction.summary.bill[i].condition) + ")";
            billObject.condition = transaction.summary.bill[i].condition;
          }

          bill += ": " + parseFloat(value).toFixed(2);

          if (discount) {
            bill +=
              " <span class='small'>(" +
              discount +
              "% off from " +
              parseFloat(
                transaction.summary.bill[i].tokens || transaction.summary.bill[i].value
              ).toFixed(2) +
              ")</span>";
            billObject.item += " (-" + discount + "%)";
          }

          if (transaction.summary.bill[i].quantity > 1) {
            bill += " <b>x" + transaction.summary.bill[i].quantity + "</b>";
            billObject.quantity = transaction.summary.bill[i].quantity;
          }

          formattedTransaction.billArray.push(billObject);
        }
        if (i + 1 !== transaction.summary.bill.length) {
          bill += "<br />";
        }
      }

      if (transaction.summary.comment) {
        bill += "<br />Comment: " + transaction.summary.comment;
      }

      formattedTransaction.bill = bill;

      formattedTransaction.comment = transaction.summary.comment;
      formattedTransaction.transaction_id = transaction.transaction_id;
      formattedTransaction.sumup_id = transaction.summary.sumupId || null;
      formattedTransaction.paymentMethod = transaction.summary.paymentMethod;

      if (transaction.summary.paymentMethod == "card" && !transaction.summary.sumupId) {
        formattedTransaction.paymentFailed = true;
      }

      if (transaction.summary.bill[0].item_id == "refund") {
        formattedTransaction.isRefund = true;
      }

      if (transaction.summary.bill[0].item_id == "yoyoCup") {
        formattedTransaction.isYoyoCupReturn = true;
      }

      formattedTransactions.push(formattedTransaction);
    }

    return formattedTransactions;
  };
};
