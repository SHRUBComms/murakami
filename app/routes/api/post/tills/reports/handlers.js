const moment = require("moment");
const lodash = require("lodash");
const Decimal = require("decimal.js");
//handle bill items handlers
const handleBillItem = ({
  transaction,
  billItem,
  till,
  transactionDiscountAbsolute,
  categories,
}) => {
  if (
    (!categories[billItem.item_id] && !["giftcard", "yoyoCup"].includes(billItem.item_id)) ||
    billItem.item_id === "donation" ||
    categories[billItem.item_id]?.discount > 0
  ) {
    return;
  }

  return {
    transaction_id: transaction.transaction_id,
    date: moment(transaction.date).format("L"),
    till_name: till.name,
    isMember: transaction.member_id !== "anon",
    item:
      billItem.item_id === "giftcard"
        ? "Giftcard"
        : billItem.item_id === "donation"
          ? "Donation"
          : billItem.item_id === "yoyoCup"
            ? "Yoyo Cup Return"
            : categories[billItem.item_id].absolute_name,
    quantity: billItem.quantity || 1,
    valueBeforeDiscountsAndTokens: billItem.value || 0,
    attributedCashEquivalentSaleValue: null,
    condition: billItem.condition ? lodash.startCase(billItem.condition) : "-",
    payment_method: lodash.startCase(transaction.summary.paymentMethod || "-"),
    transactionTotalAbsoluteDiscount: transactionDiscountAbsolute,
    transactionTotalTokens: transaction.summary.totals.tokens,
    sumupId: transaction.summary.sumupId,
    allowsTokens: Boolean(categories[billItem.item_id]?.allowTokens),
  };
};

const handleTransaction = ({ transaction, till, categories }) => {
  if (!transaction.summary.bill || transaction.summary.bill.length === 0) {
    return [];
  }

  // Skip failed card transactions
  if (transaction.summary.paymentMethod === "card" && !transaction.summary.sumupId) {
    return [];
  }
  const transactionDiscountMultiplier =
    1 -
    transaction.summary.bill
      .filter((i) => i.discount === 1)
      .reduce((acc, item) => acc + (item.value || 0), 0) /
      100;
  const transactionDiscountAbsolute = transaction.summary.bill
    .filter((i) => i.discount === 2)
    .reduce((acc, item) => acc - (item.value || 0), 0);

  const transactionBillItems = [];
  for (const item of transaction.summary.bill) {
    const transactionBillItem = handleBillItem({
      transaction,
      billItem: item,
      till,
      categories,
    });
    if (transactionBillItem) {
      transactionBillItems.push(transactionBillItem);
    }
  }
  const totalBeforeDiscountsDecimal = transactionBillItems.reduce(
    (acc, i) => acc.add(new Decimal(i.valueBeforeDiscountsAndTokens || 0)),
    new Decimal(0)
  );
  const totalTokenEligibleDecimal = transactionBillItems.reduce(
    (acc, i) => acc.add(new Decimal(i.allowsTokens ? i.valueBeforeDiscountsAndTokens || 0 : 0)),
    new Decimal(0)
  );
  transactionBillItems.forEach((item) => {
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
    item.transactionTotalAbsoluteDiscount = transactionDiscountAbsolute;
    item.transactionTotalTokens = transaction.summary.totals.tokens;
    item.transactionTotalGiftCards = transaction.summary.totals.giftCards;
    item.transactionDiscountMultiplier = transactionDiscountMultiplier;
    item.transactionTotalAbsoluteDiscount = transactionDiscountAbsolute;
  });

  //Correct possible rounding errors
  const totalWithDiscounts = transactionBillItems.reduce(
    (acc, i) => acc.add(new Decimal(i.attributedCashEquivalentSaleValue || 0)),
    new Decimal(0)
  );
  const totalCashEquivalentPaid = new Decimal(transaction.summary.totals.cash || 0)
    .add(transaction.summary.totals.giftCards || 0)
    .add(transaction.summary.totals.card || 0);

  const roundingError = totalWithDiscounts.sub(totalCashEquivalentPaid);
  if (roundingError.abs().gt(0.0)) {
    //adjust the first item
    transactionBillItems[0].attributedCashEquivalentSaleValue = new Decimal(
      transactionBillItems[0].attributedCashEquivalentSaleValue
    )
      .sub(roundingError)
      .toNumber();
  }
  return transactionBillItems;
};

module.exports = {
  handleBillItem,
  handleTransaction,
};
