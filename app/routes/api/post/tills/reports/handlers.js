const moment = require("moment");
const lodash = require("lodash");
const Decimal = require("decimal.js");

/*
  handleBillItem

  Processes a single bill item. If the item should be skipped (eg due to discounts,
  being a donation, or not having a valid category), nothing is returned.
*/
const handleBillItem = ({ billItem, categories }) => {
  // Skip if the item has no category but isn't an allowed promo (or is a donation)
  if (
    (!categories[billItem.item_id] && !["yoyoCup", "refund"].includes(billItem.item_id)) ||
    ["donation", "giftcard"].includes(billItem.item_id) ||
    categories[billItem.item_id]?.discount > 0
  ) {
    return;
  }

  let itemName;
  switch (billItem.item_id) {
    case "giftcard":
      itemName = "Giftcard";
      break;
    case "donation":
      itemName = "Donation";
      break;
    case "yoyoCup":
      itemName = "Yoyo Cup Return";
      break;
    case "refund":
      itemName = "Refund";
      break;
    default:
      itemName = categories[billItem.item_id].absolute_name;
      break;
  }

  return {
    item: itemName,
    quantity: billItem.quantity || 1,
    valueBeforeDiscountsAndTokens:
      billItem.item_id === "refund" ? -billItem.value : billItem.value || 0,
    condition: billItem.condition ? lodash.startCase(billItem.condition) : "-",
    allowsTokens: Boolean(categories[billItem.item_id]?.allowTokens),
  };
};

/*
  handleTransaction

  Processes an entire transaction.
  • Skips transactions without bill items or failed card transactions.
  • It splits items with quantity > 1, calculates relative discounts, and
    adjusts for rounding errors.
  
  Modification:
  • For giftcard items, discounts/tokens adjustments are not applied.
*/
const handleTransaction = ({ transaction, till, categories }) => {
  if (!transaction.summary.bill || transaction.summary.bill.length === 0) {
    return [];
  }

  // Skip failed card transactions (if no sumupId is present)
  if (transaction.summary.paymentMethod === "card" && !transaction.summary.sumupId) {
    return [];
  }

  // Calculate discount and absolute discount amounts from the bill's discount items
  const transactionDiscountMultiplier =
    1 -
    transaction.summary.bill
      .filter((i) => i.discount === 1)
      .reduce((acc, item) => acc + (item.value || 0), 0) /
      100;
  const transactionDiscountAbsolute = transaction.summary.bill
    .filter((i) => i.discount === 2)
    .reduce((acc, item) => acc - (item.value || 0), 0);

  // Process each bill item and (if quantity > 1) split into separate objects using flatMap
  let transactionBillItems = transaction.summary.bill.flatMap((item) => {
    const processed = handleBillItem({ billItem: item, categories });
    if (!processed) return [];
    if (processed.quantity > 1) {
      return Array.from({ length: processed.quantity }, () => ({ ...processed, quantity: 1 }));
    }
    return processed;
  });

  // Calculate totals using Decimal arithmetic
  const totalBeforeDiscountsDecimal = transactionBillItems.reduce(
    (acc, i) => acc.add(new Decimal(i.valueBeforeDiscountsAndTokens || 0)),
    new Decimal(0)
  );
  const totalTokenEligibleDecimal = transactionBillItems.reduce(
    (acc, i) => acc.add(new Decimal(i.allowsTokens ? i.valueBeforeDiscountsAndTokens || 0 : 0)),
    new Decimal(0)
  );

  // Shared transaction attributes for each final bill item
  const sharedAttributes = {
    transaction_id: transaction.transaction_id,
    date: moment(transaction.date).format("L"),
    till_name: till.name,
    member_id: transaction.member_id,
    transactionTotalAbsoluteDiscount: transactionDiscountAbsolute,
    transactionTotalTokens: transaction.summary.totals.tokens,
    transactionTotalGiftCards: transaction.summary.totals.giftCards,
    transactionDiscountMultiplier: transactionDiscountMultiplier,
    sumupId: transaction.summary.sumupId,
    payment_method: lodash.startCase(transaction.summary.paymentMethod || "-"),
  };

  // Apply proportional discount and token adjustments to each bill item.
  transactionBillItems = transactionBillItems.map((item) => {
    const itemValue = new Decimal(item.valueBeforeDiscountsAndTokens || 0);
    const absoluteDiscount = new Decimal(transactionDiscountAbsolute || 0);
    const tokensValue = new Decimal(transaction.summary.totals.tokens || 0);
    const discountMultiplier = new Decimal(transactionDiscountMultiplier || 1);

    const portionOfAbsoluteDiscount = totalBeforeDiscountsDecimal.isZero()
      ? new Decimal(0)
      : itemValue.div(totalBeforeDiscountsDecimal);
    const portionOfTokensDiscount =
      !item.allowsTokens || totalTokenEligibleDecimal.isZero()
        ? new Decimal(0)
        : itemValue.div(totalTokenEligibleDecimal);

    item.attributedCashEquivalentSaleValue = itemValue
      .add(portionOfAbsoluteDiscount.mul(absoluteDiscount))
      .sub(portionOfTokensDiscount.mul(tokensValue))
      .mul(discountMultiplier)
      .toDP(2)
      .toNumber();
    return { ...sharedAttributes, ...item };
  });

  // If the transaction is a refund, return the transactionBillItems without attempting to correct rounding errors
  if (transaction.summary.refundedTransactionId || transactionBillItems.length === 0) {
    return transactionBillItems;
  }

  // Correct possible rounding errors between calculated total and paid total
  const totalWithDiscounts = transactionBillItems.reduce(
    (acc, i) => acc.add(new Decimal(i.attributedCashEquivalentSaleValue || 0)),
    new Decimal(0)
  );
  const totalCashEquivalentPaid = new Decimal(transaction.summary.totals.money || 0).add(
    transaction.summary.totals.giftcard || 0
  );

  const roundingError = totalWithDiscounts.sub(totalCashEquivalentPaid);
  if (roundingError.abs().gt(0.0)) {
    // Adjust the first suitable item by subtracting the rounding error
    const indexToAdjust = transactionBillItems.findIndex(
      (item) =>
        !new Decimal(item.valueBeforeDiscountsAndTokens).eq(item.attributedCashEquivalentSaleValue)
    );
    const adjustIndex = indexToAdjust >= 0 ? indexToAdjust : 0;

    transactionBillItems[adjustIndex].attributedCashEquivalentSaleValue = new Decimal(
      transactionBillItems[adjustIndex].attributedCashEquivalentSaleValue
    )
      .sub(roundingError)
      .toNumber();
  }

  return transactionBillItems;
};

const convertTillActivityToFloatsReport = async ({ activity, usersObj }) => {
  const formattedActivity = [];

  let previousAction = null;
  const sortedActivity = activity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  for (const action of sortedActivity) {
    const formattedAction = {};

    formattedAction.timestamp = moment(action.timestamp).format("L hh:mm A");

    if (action.opening === 1) {
      formattedAction.action = "Opening";

      formattedAction.summary = "Counted Float: £" + action.counted_float.toFixed(2);

      formattedAction.discrepancy = "";
    } else {
      formattedAction.action = "Closing";
      formattedAction.summary = "Counted Float: £" + action.counted_float.toFixed(2);
      formattedAction.summary += "<br />";
      formattedAction.summary += "Expected Float: £" + action.expected_float.toFixed(2);

      const discrepancy = (action.counted_float - action.expected_float).toFixed(2);

      if (discrepancy >= 0) {
        formattedAction.discrepancy = "" + discrepancy;
      } else {
        formattedAction.discrepancy = "-" + Math.abs(discrepancy).toFixed(2);
      }
    }

    if (action.note) {
      formattedAction.note = action.note;
    } else {
      formattedAction.note = "-";
    }

    if (usersObj[action.user_id]) {
      formattedAction.user = usersObj[action.user_id].name;
    } else {
      formattedAction.user = "Unknown User";
    }

    if (
      previousAction?.opening === 0 &&
      action.opening === 1 &&
      previousAction.counted_float !== action.counted_float
    ) {
      const transferToFromTill = new Decimal(previousAction.counted_float).sub(
        action.counted_float
      );

      const floatToSafeAction = {
        action: "Transfer to Safe",
        summary: `Implied cash to safe: £${transferToFromTill.negated().toFixed(2)}`,
        discrepancy: "",
        transferToFromTill: transferToFromTill.toFixed(2),
      };
      formattedActivity.push(floatToSafeAction);
    }
    formattedActivity.push(formattedAction);
    previousAction = action;
  }
  return formattedActivity;
};
module.exports = {
  handleBillItem,
  handleTransaction,
  convertTillActivityToFloatsReport,
};
