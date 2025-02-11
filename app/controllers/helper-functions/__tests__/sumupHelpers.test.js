const SumUpAuth = require("../SumUpAuth");
const SumUpGetTransactionsBetweenTwoDates = require("../SumUpGetTransactionsBetweenTwoDates");
const SumUpGetTransaction = require("../SumUpGetTransaction");
const SumUpHandleInPersonCardPayment = require("../sumUpHandleInPersonCardPaymentURIScheme");
require("dotenv").config({ path: ".env.test" });

//Note: this test requires a .env.test file with the correct SumUp credentials and values from the database
// Mock the Models/Settings
jest.mock("../../../models/sequelize", () => ({
  Settings: {
    getById: jest.fn(),
  },
}));

describe("SumUp Helper Functions", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    const Models = require("../../../models/sequelize");
    Models.Settings.getById.mockResolvedValue({
      data: {
        code: process.env.ENCRYPTED_SUMUP_OAUTH2_CODE,
        refreshToken: process.env.ENCRYPTED_SUMUP_OAUTH2_REFRESH_TOKEN,
      },
    });
  });
  //to run: npx jest app/controllers/helper-functions/__tests__/sumupHelpers.test.js
  describe("SumUpAuth", () => {
    it("should successfully get access token with OAuth2", async () => {
      // Mock the encrypted settings response

      const result = await SumUpAuth();
      console.log(result);
      expect(result).toBeTruthy();
    });
  });

  describe("SumUpGetTransactionsBetweenTwoDates", () => {
    it("should successfully fetch transactions", async () => {
      const startDate = new Date("2024-12-15");
      const endDate = new Date("2025-01-15");
      const accessToken = await SumUpAuth();
      const result = await SumUpGetTransactionsBetweenTwoDates(startDate, endDate, accessToken);
      expect(result.items.length).toBe(2);
    });
  });

  describe("SumUpGetTransaction", () => {
    it("should successfully fetch a transaction", async () => {
      const accessToken = await SumUpAuth();
      const result = await SumUpGetTransaction({
        transactionId: "TFFK393EE2",
        accessToken,
        lookupField: "transaction_code",
      });
      expect(result).toBeTruthy();
      expect(result.amount).toBe(5);
    });
  });

  // To run this test only: npx jest -t "SumUpHandleInPersonCardPayment should successfully create a checkout" app/controllers/helper-functions/__tests__/sumupHelpers.test.js
  describe("SumUpHandleInPersonCardPayment", () => {
    it("should successfully create a checkout without a member", async () => {
      const mockTransactionId = "1234567890";
      const mockAmount = 5;
      const mockWorkingGroupName = "Test transaction";
      const mockTillId = "1234567890";
      const mockResponse = {
        status: "PENDING",
        transactionSummary: "Test transaction",
        carbonSummary: "Test transaction",
      };
      const result = await SumUpHandleInPersonCardPayment({
        transactionId: mockTransactionId,
        amount: mockAmount,
        workingGroupName: mockWorkingGroupName,
        tillId: mockTillId,
        transactionSummary: mockResponse.transactionSummary,
        carbonSummary: mockResponse.carbonSummary,
        murakamiStatus: mockResponse.status,
        member: null,
      });
      console.log(result);
      expect(result).toBeTruthy();
      expect(result.status).toBe("redirect");
      expect(result.url).toBe(
        "sumupmerchant://pay/1.0?affiliate-key=a7668302-3ffe-42b5-be77-50d936d110d3&app-id=testMurakami&title=Test transaction purchase&total=5&amount=5&currency=GBP&foreign-tx-id=1234567890&skipSuccessScreen=true&callback=https%3A%2F%2Fshrubcoop.org%2Fapi%2Fget%2Ftills%2Fsmp-callback%2F%3FmurakamiStatus%3DPENDING%26transactionSummary%3DTest%20transaction%26carbonSummary%3DTest%20transaction%26till_id%3D1234567890"
      );
    });

    it("should successfully create a checkout with a member", async () => {
      const mockTransactionId = "1234567890";
      const mockAmount = 5;
      const mockWorkingGroupName = "Test transaction";
      const mockTillId = "1234567890";
      const mockMember = {
        email: "test@test.com",
        phone_no: "1234567890",
      };
      const mockResponse = {
        status: "PENDING",
        transactionSummary: "Test transaction",
        carbonSummary: "Test transaction",
      };
      const result = await SumUpHandleInPersonCardPayment({
        transactionId: mockTransactionId,
        amount: mockAmount,
        workingGroupName: mockWorkingGroupName,
        tillId: mockTillId,
        transactionSummary: mockResponse.transactionSummary,
        carbonSummary: mockResponse.carbonSummary,
        murakamiStatus: mockResponse.status,
        member: mockMember,
      });
      console.log(result);
      expect(result).toBeTruthy();
      expect(result.status).toBe("redirect");
      expect(result.url).toBe(
        "sumupmerchant://pay/1.0?affiliate-key=a7668302-3ffe-42b5-be77-50d936d110d3&app-id=testMurakami&title=Test transaction purchase&total=5&amount=5&currency=GBP&foreign-tx-id=1234567890&skipSuccessScreen=true&callback=https%3A%2F%2Fshrubcoop.org%2Fapi%2Fget%2Ftills%2Fsmp-callback%2F%3FmurakamiStatus%3DPENDING%26transactionSummary%3DTest%20transaction%26carbonSummary%3DTest%20transaction%26till_id%3D1234567890&receipt-email=test@test.com&receipt-mobilephone=1234567890"
      );
    });
  });
});
