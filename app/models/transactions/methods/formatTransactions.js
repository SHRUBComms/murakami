var async = require("async");
var moment = require("moment");
moment.locale("en-gb");

module.exports = function(Transactions, sequelize, DataTypes) {
  return function(transactions, members, flatCategories, till_id, callback) {
    var flatCategoriesAsObj = {};
    async.each(
      flatCategories,
      function(category, callback) {
        flatCategoriesAsObj[category.item_id] = category;

        callback();
      },
      function() {
        formattedTransactions = [];
        async.each(
          transactions,
          function(transaction, callback) {
            let formattedTransaction = {};

            formattedTransaction.date = moment(transaction.date);
            formattedTransaction.date = moment(
              formattedTransaction.date
            ).format("D/M/YY hh:mm A");

            formattedTransaction.customer = {};

            formattedTransaction.till_name = transaction.till_name;

            if (transaction.member_id != "anon") {
              formattedTransaction.customer.id = transaction.member_id;
              if (members[transaction.member_id]) {
                formattedTransaction.customer.name =
                  members[transaction.member_id].first_name +
                  " " +
                  members[transaction.member_id].last_name +
                  "<br />(<a href='" +
                  process.env.PUBLIC_ADDRESS +
                  "/members/view/" +
                  transaction.member_id +
                  "?till_id=" +
                  till_id +
                  "' target='_blank''>" +
                  formattedTransaction.customer.id +
                  "</a>)";
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
                formattedTransaction.totals.cash = Number().toFixed(2);
              } else {
                formattedTransaction.totals.cash == "0.00";
              }
            }

            if (transaction.summary.paymentMethod == "card") {
              if (!isNaN(transaction.summary.totals.money)) {
                formattedTransaction.totals.card = Number(
                  transaction.summary.totals.money
                ).toFixed(2);
              } else {
                formattedTransaction.totals.card = "0.00";
              }
              formattedTransaction.totals.cash = "0.00";
            }

            formattedTransaction.totals.tokens =
              transaction.summary.totals.tokens || "0";

            if(!isNaN(transaction.summary.totals.money)){
              formattedTransaction.totals.money =
                "£" +
                (Number(transaction.summary.totals.money).toFixed(2) || "0.00");
            } else {
              formattedTransaction.totals.money = "£0.00"
            }


            formattedTransaction.paymentMethod =
              transaction.summary.paymentMethod || "";

            if (formattedTransaction.paymentMethod) {
              formattedTransaction.totals.money +=
                " (" + formattedTransaction.paymentMethod.toProperCase() + ")";
            }

            if (!isNaN(transaction.summary.totals.money)) {
              formattedTransaction.totals.moneyPlain =
                Number(transaction.summary.totals.money).toFixed(2);
            } else {
              formattedTransaction.totals.moneyPlain = "0.00";
            }

            formattedTransaction.billArray = [];

            let bill = "";

            if (
              transaction.summary.paymentMethod == "card" &&
              !transaction.summary.sumupId
            ) {
              bill =
                "<p class='text-danger font-weight-bold'>Payment failed!</p>";
            }

            for (let i = 0; i < transaction.summary.bill.length; i++) {
              if (transaction.summary.bill[i].item_id == "donation") {
                bill += "c: " + transaction.summary.bill[i].tokens;
                formattedTransaction.billArray.push({
                  item: "Tokens added for donation",
                  value: transaction.summary.bill[i].tokens
                });
              } else if (
                transaction.summary.bill[i].item_id == "volunteering"
              ) {
                bill +=
                  "Tokens added for volunteering: " +
                  transaction.summary.bill[i].tokens;
                formattedTransaction.billArray.push({
                  item: "Tokens added for volunteering",
                  value: transaction.summary.bill[i].tokens
                });
              } else if (transaction.summary.bill[i].item_id == "membership") {
                bill +=
                  "Tokens added for buying a 12 month membership: " +
                  transaction.summary.bill[i].tokens;
                formattedTransaction.billArray.push({
                  item: "Tokens added for buying a 12 month membership",
                  value: transaction.summary.bill[i].tokens
                });
              } else if (transaction.summary.bill[i].item_id == "refund") {
                bill +=
                  "Refund: " +
                  Number(transaction.summary.bill[i].value).toFixed(2);
                formattedTransaction.billArray.push({
                  item: "Refund",
                  value: Number(transaction.summary.bill[i].value).toFixed(2)
                });
              } else {
                let value =
                  transaction.summary.bill[i].tokens ||
                  transaction.summary.bill[i].value;

                let discount;
                if (transaction.summary.discount_info) {
                  if (
                    transaction.summary.discount_info[
                      transaction.summary.bill[i].item_id
                    ]
                  ) {
                    discount =
                      transaction.summary.discount_info[
                        transaction.summary.bill[i].item_id
                      ];
                    value = value - value * (discount / 100);
                  }
                }

                let billObject = {
                  value: Number(value).toFixed(2)
                };

                if (flatCategoriesAsObj[transaction.summary.bill[i].item_id]) {
                  bill +=
                    flatCategoriesAsObj[transaction.summary.bill[i].item_id]
                      .absolute_name;
                  billObject.item =
                    flatCategoriesAsObj[
                      transaction.summary.bill[i].item_id
                    ].absolute_name;
                } else {
                  bill += "Unknown Item: ";
                  billObject.item = "Unkown Item";
                }

                if (transaction.summary.bill[i].condition) {
                  bill += " (" + transaction.summary.bill[i].condition + ")";
                  billObject.condition = transaction.summary.bill[i].condition;
                }

                bill += ": " + parseFloat(value).toFixed(2);
                if (discount) {
                  bill +=
                    " <span class='small'>(" +
                    discount +
                    "% off from " +
                    parseFloat(
                      transaction.summary.bill[i].tokens ||
                        transaction.summary.bill[i].value
                    ).toFixed(2) +
                    ")</span>";
                  billObject.item += " (-" + discount + "%)";
                }

                if (transaction.summary.bill[i].quantity > 1) {
                  bill +=
                    " <b>x" + transaction.summary.bill[i].quantity + "</b>";
                  billObject.quantity = transaction.summary.bill[i].quantity;
                }

                formattedTransaction.billArray.push(billObject);

                if (i + 1 !== transaction.summary.bill.length) {
                  bill += "<br />";
                }
              }
            }

            if (transaction.summary.comment) {
              bill += "<br />Comment: " + transaction.summary.comment;
            }

            formattedTransaction.bill = bill;

            formattedTransaction.transaction_id = transaction.transaction_id;
            formattedTransaction.sumup_id = transaction.summary.sumupId || null;
            formattedTransaction.paymentMethod =
              transaction.summary.paymentMethod;
            if (
              transaction.summary.paymentMethod == "card" &&
              !transaction.summary.sumupId
            ) {
              formattedTransaction.paymentFailed = true;
            }
            if (transaction.summary.bill[0].item_id == "refund") {
              formattedTransaction.isRefund = true;
            }
            formattedTransactions.push(formattedTransaction);

            callback();
          },
          function() {
            callback(formattedTransactions);
          }
        );
      }
    );
  };
};
