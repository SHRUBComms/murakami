const { postProcessTransaction } = require("./.../transactionService");
const moment = require("moment");

jest.mock("./.../app/models/sequelizes");
const Models = require("./../app/models/sequelize");
const Tills = Models.Tills;
const Members = Models.Members;
const Transactions = Models.Transactions;
//Test member discount cash
//Test member discount card
//Test token payments
describe("postProcessTransaction", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("throws an error if user does not have permission", async () => {
    Tills.getOpenTill.mockResolvedValue({ group_id: "someGroupId" });
    const transactionData = {
      till_id: "123",
      member_id: "456",
      paymentMethod: "cash",
      transaction: [],
      payWithTokens: false,
      note: "A note",
      user: {
        id: "user1",
        permissions: { tills: { processTransaction: false } },
        working_groups: [],
      },
    };

    await expect(postProcessTransaction(transactionData)).rejects.toThrow(
      "You don't have permission to process transactions on this till"
    );
  });

  it("handles missing member correctly", async () => {
    Tills.getOpenTill.mockResolvedValue({ group_id: "someGroupId" });
    Members.getById.mockResolvedValue(null);
    const transactionData = {
      till_id: "123",
      member_id: null,
      paymentMethod: "cash",
      transaction: [],
      payWithTokens: false,
      note: "A note",
      user: {
        id: "user1",
        permissions: {
          tills: { processTransaction: "commonWorkingGroup" },
          working_groups: ["someGroupId"],
        },
      },
    };

    await expect(postProcessTransaction(transactionData)).rejects.toThrow(
      "Member not found!"
    );
  });

  describe("postProcessTransaction - Card Payment", () => {
    beforeEach(() => {
      jest.resetAllMocks();

      // Mocks for supporting methods and external dependencies
      Tills.getOpenTill.mockResolvedValue({
        group_id: "someGroupId",
        name: "Group Name",
      });
      Members.getById.mockResolvedValue({
        id: "member1",
        is_member: 1,
        balance: 100,
        membership_type: "paid",
        email: "email@example.com",
        phone_no: "1234567890",
      });
      Transactions.addTransaction.mockResolvedValue("transactionId123");
    });

    it("creates the correct SumUp callback URI for card payments", async () => {
      const transactionData = {
        till_id: "123",
        member_id: "member1",
        paymentMethod: "card",
        transaction: [{ item_id: "item1", price: 10 }],
        payWithTokens: false,
        note: "Test transaction",
        user: {
          id: "user1",
          permissions: {
            tills: { processTransaction: true },
          },
          working_groups: ["someGroupId"],
          allWorkingGroupsObj: {
            someGroupId: { name: "Group Name" },
          },
        },
      };

      const result = await postProcessTransaction(transactionData);

      const expectedUri = `sumupmerchant://pay/1.0?affiliate-key=${
        process.env.SUMUP_AFFILIATE_KEY
      }&app-id=${
        process.env.SUMUP_APP_ID
      }&title=Group Name purchase&total=10&amount=10&currency=GBP&foreign-tx-id=transactionId123&skipSuccessScreen=${
        process.env.DISABLE_SUMUP_RECEIPTS
      }&callback=${encodeURIComponent(
        `${process.env.PUBLIC_ADDRESS}/api/get/tills/smp-callback/?murakamiStatus=ok&transactionSummary= £10 paid&carbonSummary=&till_id=123`
      )}&receipt-email=email@example.com&receipt-mobilephone=1234567890`;

      expect(result).toEqual({ status: "redirect", url: expectedUri });
      expect(Tills.getOpenTill).toHaveBeenCalledWith("123");
      expect(Members.getById).toHaveBeenCalledWith(
        "member1",
        expect.any(Object)
      );
      expect(Transactions.addTransaction).toHaveBeenCalled();
    });
  });
});
