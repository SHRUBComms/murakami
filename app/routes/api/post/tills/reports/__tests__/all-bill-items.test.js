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
  donation: {
    absolute_name: "Donation",
    allowTokens: false,
    discount: 0,
  },
};

const standardBillItemResponse = (transaction, mockTill, index) => ({
  transaction_id: transaction.transaction_id,
  date: moment(transaction.date).format("L"),
  till_name: mockTill.name,
  member_id: transaction.member_id,
  item: mockCategories[transaction.summary.bill[index].item_id].absolute_name,
  quantity: 1,
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
      billItem,
      categories: mockCategories,
    });

    expect(result).toEqual({
      item: "Test Item 1",
      quantity: 2,
      valueBeforeDiscountsAndTokens: 10,
      condition: "New",
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
      billItem,
      categories: mockCategories,
    });

    expect(result).toBeUndefined();
  });

  //npx jest -t "skips discounted items" app/routes/api/post/tills/reports/__tests__/all-bill-items.test.js
  test("skips discount items", () => {
    const billItem = {
      item_id: "absolute-discount",
      quantity: 1,
      value: 10,
    };

    const result = handleBillItem({
      billItem,
      categories: mockCategories,
    });

    expect(result).toBeUndefined();
  });
});

// npx jest -t "handleTransaction" app/routes/api/post/tills/reports/__tests__/all-bill-items.test.js
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
    expect(result).toHaveLength(3);
    expect(result.reduce((acc, i) => acc + i.quantity, 0)).toBe(3);
    expect(result[0].item).toBe("Test Item 1");
    expect(result[1].item).toBe("Test Item 1");
    expect(result[2].item).toBe("Test Item 2");
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
          giftcard: 2,
          money: 174.4,
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
      new Decimal(transaction.summary.totals.money || 0).add(
        transaction.summary.totals.giftcard || 0
      )
    );
  });

  test("handles transaction with gift card use", () => {
    const transaction = {
      transaction_id: "test-123",
      date: "2024-03-20",
      summary: {
        bill: [
          {
            value: 70,
            item_id: "item-1",
            quantity: 1,
          },
          {
            value: 50,
            item_id: "absolute-discount",
            discount: 2,
          },
          {
            value: 10,
            item_id: "giftcard",
            quantity: 1,
          },
        ],
        totals: {
          money: 10,
          giftcard: 10,
        },
        paymentMethod: "cash",
      },
    };

    const result = handleTransaction({ transaction, till: mockTill, categories: mockCategories });
    expect(result).toHaveLength(1);
    expect(result).toEqual([
      {
        //item-1
        attributedCashEquivalentSaleValue: 20,
        transactionTotalAbsoluteDiscount: -50,
        transactionDiscountMultiplier: 1,
        ...standardBillItemResponse(transaction, mockTill, 0),
      },
    ]);
    expect(
      result.reduce((acc, i) => acc.add(i.attributedCashEquivalentSaleValue), new Decimal(0))
    ).toEqual(
      new Decimal(transaction.summary.totals.money || 0).add(
        transaction.summary.totals.giftcard || 0
      )
    );
  });
  //   npx jest -t "handles transaction with discounts, tokens, and gift cards" app/routes/api/post/tills/reports/__tests__/all-bill-items.test.js
  test("handles multiple quantity with gift card use", () => {
    const transaction = {
      transaction_id: "test-123",
      date: "2024-03-20",
      summary: {
        bill: [
          {
            value: 70,
            item_id: "item-1",
            quantity: 2,
          },
        ],
        totals: {
          money: 130,
          giftcard: 10,
        },
        paymentMethod: "cash",
      },
    };

    const result = handleTransaction({ transaction, till: mockTill, categories: mockCategories });
    expect(result).toHaveLength(2);
    expect(result).toEqual([
      {
        //item-1
        attributedCashEquivalentSaleValue: 70,
        transactionTotalAbsoluteDiscount: 0,
        transactionDiscountMultiplier: 1,
        ...standardBillItemResponse(transaction, mockTill, 0),
      },
      {
        //item-1
        attributedCashEquivalentSaleValue: 70,
        transactionTotalAbsoluteDiscount: 0,
        transactionDiscountMultiplier: 1,
        ...standardBillItemResponse(transaction, mockTill, 0),
      },
    ]);
    expect(
      result.reduce((acc, i) => acc.add(i.attributedCashEquivalentSaleValue), new Decimal(0))
    ).toEqual(
      new Decimal(transaction.summary.totals.money || 0).add(
        transaction.summary.totals.giftcard || 0
      )
    );
  });

  test("returns empty array when no bill items provided", () => {
    const transaction = {
      transaction_id: "no-bill-123",
      date: "2024-03-25",
      member_id: "anon",
      summary: {
        bill: [],
        paymentMethod: "cash",
        totals: { tokens: 0, giftCards: 0, cash: 0, card: 0 },
      },
    };

    const result = handleTransaction({ transaction, till: mockTill, categories: mockCategories });
    expect(result).toEqual([]);
  });

  test("returns empty array when all bill items are skipped (donation items)", () => {
    const transaction = {
      transaction_id: "donation-only",
      date: "2024-03-25",
      member_id: "anon",
      summary: {
        bill: [
          {
            item_id: "donation",
            quantity: 1,
            value: 100,
          },
          {
            item_id: "giftcard",
            quantity: 2,
            value: 100,
          },
        ],
        paymentMethod: "cash",
        totals: { tokens: 0, giftCards: 0, cash: 0, card: 0 },
      },
    };

    const result = handleTransaction({ transaction, till: mockTill, categories: mockCategories });
    expect(result).toEqual([]);
  });
  test("handles refunds correctly", () => {
    const transaction = {
      transaction_id: "refund-123",
      date: "2024-03-25",
      member_id: "anon",
      summary: {
        bill: [
          {
            value: "90.00",
            item_id: "refund",
          },
        ],
        totals: {
          money: "90.00",
        },
        comment: "Complete refund",
        paymentMethod: "cash",
        refundedTransactionId: "60695301",
      },
    };
    const result = handleTransaction({ transaction, till: mockTill, categories: mockCategories });
    expect(result.length).toEqual(1);
    expect(result[0].attributedCashEquivalentSaleValue).toEqual(-90);
  });

  test("handles items which are no longer in the categories by ignoring them", () => {
    const transaction = {
      transaction_id: "random-item-123",
      date: "2024-03-25",
      member_id: "anon",
      summary: {
        bill: [
          {
            value: "90.00",
            item_id: "random-item",
          },
        ],
        totals: {
          money: "90.00",
        },
        paymentMethod: "cash",
      },
    };
    const result = handleTransaction({ transaction, till: mockTill, categories: mockCategories });
    expect(result).toEqual([]);
  });
  test("handles transactions which are tokens only", () => {
    const transaction = {
      transaction_id: "token-only",
      date: "2024-03-25",
      member_id: "12345",
      summary: {
        bill: [
          {
            value: 0,
            weight: 200,
            item_id: "item-3",
            quantity: 1,
            condition: null,
          },
          //allow tokens, no discount
          {
            value: 5,
            weight: 50,
            item_id: "item-2",
            quantity: 1,
            condition: null,
          },
          {
            value: 10,
            weight: 150,
            item_id: "item-2",
            quantity: 1,
            condition: null,
          },
          {
            value: 4.5,
            weight: 150,
            item_id: "item-2",
            quantity: 1,
            condition: null,
          },
        ],
        totals: {
          tokens: 20,
        },
        comment: "",
        discount_info: {},
        paymentMethod: null,
      },
    };
    const result = handleTransaction({ transaction, till: mockTill, categories: mockCategories });
    expect(result).toEqual([
      {
        //item-1
        attributedCashEquivalentSaleValue: 0,
        transactionTotalAbsoluteDiscount: 0,
        transactionDiscountMultiplier: 1,
        ...standardBillItemResponse(transaction, mockTill, 0),
      },
      {
        //item-2
        attributedCashEquivalentSaleValue: -0,
        transactionTotalAbsoluteDiscount: 0,
        transactionDiscountMultiplier: 1,
        ...standardBillItemResponse(transaction, mockTill, 1),
      },
      {
        //item-3
        attributedCashEquivalentSaleValue: 0,
        transactionTotalAbsoluteDiscount: 0,
        transactionDiscountMultiplier: 1,
        ...standardBillItemResponse(transaction, mockTill, 2),
      },
      {
        //item-4
        attributedCashEquivalentSaleValue: 0,
        transactionTotalAbsoluteDiscount: 0,
        transactionDiscountMultiplier: 1,
        ...standardBillItemResponse(transaction, mockTill, 3),
      },
    ]);
  });
});
