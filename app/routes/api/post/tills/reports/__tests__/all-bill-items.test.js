const moment = require("moment");
const lodash = require("lodash");
const Decimal = require("decimal.js");
const { handleBillItem, handleTransaction } = require("../handlers");

//npx jest app/routes/api/post/tills/reports/__tests__/all-bill-items.test.js
const mockCategories = {
  "item-1": {
    absolute_name: "Test Item 1",
    allowTokens: true,
    discount: 0,
  },
  "item-2": {
    absolute_name: "Test Item 2",
    allowTokens: true,
    discount: 0,
  },
  "item-3": {
    absolute_name: "Test Item 3",
    allowTokens: false,
    discount: 0,
  },
  "item-4": {
    absolute_name: "Test Item 4",
    allowTokens: false,
    discount: 0,
  },
  "absolute-discount": {
    absolute_name: "Absolute Discount",
    allowTokens: false,
    discount: 2,
  },
  "percentage-discount": {
    absolute_name: "Percentage Discount",
    allowTokens: false,
    discount: 1,
  },
};

const standardBillItemResponse = (transaction, mockTill, index) => ({
  transaction_id: transaction.transaction_id,
  date: moment(transaction.date).format("L"),
  till_name: mockTill.name,
  isMember: transaction.member_id !== "anon",
  item: mockCategories[transaction.summary.bill[index].item_id].absolute_name,
  quantity: transaction.summary.bill[index].quantity || 1,
  valueBeforeDiscountsAndTokens: transaction.summary.bill[index].value || 0,
  condition: "-",
  payment_method: lodash.startCase(transaction.summary.paymentMethod || "-"),
  transactionTotalTokens: transaction.summary.totals.tokens,
  transactionTotalGiftCards: transaction.summary.totals.giftCards,
  sumupId: transaction.summary.sumupId,
  allowsTokens: Boolean(mockCategories[transaction.summary.bill[index].item_id]?.allowTokens),
});
describe("handleBillItem", () => {
  const mockTransaction = {
    transaction_id: "test-123",
    date: "2024-03-20",
    member_id: "anon",
    summary: {
      paymentMethod: "card",
      sumupId: "sumup-123",
      totals: {
        tokens: 0,
      },
    },
  };

  const mockTill = {
    name: "Test Till",
  };

  test("handles regular item correctly", () => {
    const billItem = {
      item_id: "item-1",
      quantity: 2,
      value: 10,
      condition: "new",
    };

    const result = handleBillItem({
      transaction: mockTransaction,
      billItem,
      till: mockTill,
      transactionDiscountMultiplier: 1,
      transactionDiscountAbsolute: 0,
      transactionTotalTokens: 0,
      categories: mockCategories,
    });

    expect(result).toEqual({
      transaction_id: "test-123",
      date: moment(mockTransaction.date).format("L"),
      till_name: "Test Till",
      isMember: false,
      item: "Test Item 1",
      quantity: 2,
      value: 10,
      condition: "New",
      payment_method: "Card",
      transactionTotalAbsoluteDiscount: 0,
      transactionTotalTokens: 0,
      sumupId: "sumup-123",
      allowsTokens: true,
    });
  });

  test("handles gift card correctly", () => {
    const billItem = {
      item_id: "giftcard",
      quantity: 1,
      value: 20,
    };

    const result = handleBillItem({
      transaction: mockTransaction,
      billItem,
      till: mockTill,
      transactionDiscountMultiplier: 1,
      transactionDiscountAbsolute: 0,
      transactionTotalTokens: 0,
      categories: mockCategories,
    });

    expect(result).toEqual({
      transaction_id: "test-123",
      date: moment(mockTransaction.date).format("L"),
      till_name: "Test Till",
      isMember: false,
      item: "Giftcard",
      quantity: 1,
      value: 20,
      condition: "-",
      payment_method: "Card",
      transactionTotalAbsoluteDiscount: 0,
      transactionTotalTokens: 0,
      sumupId: "sumup-123",
      allowsTokens: false,
    });
  });

  //npx jest -t "skips discounted items" app/routes/api/post/tills/reports/__tests__/all-bill-items.test.js
  test("skips discount items", () => {
    const billItem = {
      item_id: "absolute-discount",
      quantity: 1,
      value: 10,
    };

    const result = handleBillItem({
      transaction: mockTransaction,
      billItem,
      till: mockTill,
      transactionDiscountMultiplier: 0,
      transactionDiscountAbsolute: 10,
      transactionTotalTokens: 0,
      categories: mockCategories,
    });

    expect(result).toBeUndefined();
  });
});

describe("handleTransaction", () => {
  const mockTill = {
    name: "Test Till",
  };

  test("handles transaction with multiple items", () => {
    const transaction = {
      transaction_id: "test-123",
      date: "2024-03-20",
      member_id: "member-123",
      summary: {
        bill: [
          {
            item_id: "item-1",
            quantity: 2,
            value: 10,
          },
          {
            item_id: "item-2",
            quantity: 1,
            value: 15,
          },
        ],
        paymentMethod: "card",
        sumupId: "sumup-123",
        totals: {
          tokens: 0,
          giftCards: 0,
        },
      },
    };

    const result = handleTransaction({ transaction, till: mockTill, categories: mockCategories });
    expect(result).toHaveLength(2);
    expect(result[0].item).toBe("Test Item 1");
    expect(result[1].item).toBe("Test Item 2");
  });

  test("skips failed card transactions", () => {
    const transaction = {
      transaction_id: "test-123",
      date: "2024-03-20",
      summary: {
        bill: [
          {
            item_id: "item-1",
            quantity: 1,
            value: 10,
          },
        ],
        paymentMethod: "card",
        sumupId: null,
        totals: {
          tokens: 0,
          giftCards: 0,
        },
      },
    };

    const result = handleTransaction({ transaction, till: mockTill, categories: mockCategories });
    expect(result).toEqual([]);
  });

  //   npx jest -t "handles transaction with discounts, tokens, and gift cards" app/routes/api/post/tills/reports/__tests__/all-bill-items.test.js
  test("handles transaction with discounts, tokens, and gift cards", () => {
    const transaction = {
      transaction_id: "test-123",
      date: "2024-03-20",
      summary: {
        bill: [
          {
            //Category allows tokens
            item_id: "item-1",
            quantity: 1,
            value: 101,
          },
          {
            //Category allows tokens
            item_id: "item-2",
            quantity: 1,
            value: 10,
          },
          {
            //Category does not allow tokens
            item_id: "item-3",
            quantity: 1,
            value: 100,
          },
          {
            //Category does not allow tokens
            item_id: "item-4",
            quantity: 1,
            value: 10,
          },
          {
            //Absolute discount
            item_id: "absolute-discount",
            quantity: 1,
            value: 20,
            discount: 2,
          },
          {
            //Percentage discount
            item_id: "percentage-discount",
            quantity: 1,
            value: 10,
            discount: 1,
          },
        ],
        paymentMethod: "cash",
        totals: {
          tokens: 5,
          giftCards: 2,
          cash: 174.4,
        },
      },
    };

    const result = handleTransaction({ transaction, till: mockTill, categories: mockCategories });
    expect(result).toHaveLength(4);
    expect(result).toEqual([
      {
        //item-1
        attributedCashEquivalentSaleValue: 78.57,
        transactionTotalAbsoluteDiscount: -20,
        transactionDiscountMultiplier: 0.9,
        ...standardBillItemResponse(transaction, mockTill, 0),
      },
      {
        //item-2
        attributedCashEquivalentSaleValue: 7.78,
        transactionTotalAbsoluteDiscount: -20,
        transactionDiscountMultiplier: 0.9,
        ...standardBillItemResponse(transaction, mockTill, 1),
      },
      {
        //item-3
        attributedCashEquivalentSaleValue: 81.86,
        transactionTotalAbsoluteDiscount: -20,
        transactionDiscountMultiplier: 0.9,
        ...standardBillItemResponse(transaction, mockTill, 2),
      },
      {
        //item-4
        attributedCashEquivalentSaleValue: 8.19,
        transactionTotalAbsoluteDiscount: -20,
        transactionDiscountMultiplier: 0.9,
        ...standardBillItemResponse(transaction, mockTill, 3),
      },
    ]);
    expect(
      result.reduce((acc, i) => acc.add(i.attributedCashEquivalentSaleValue), new Decimal(0))
    ).toEqual(
      new Decimal(transaction.summary.totals.cash || 0)
        .add(transaction.summary.totals.giftCards || 0)
        .add(transaction.summary.totals.card || 0)
    );
  });
});
