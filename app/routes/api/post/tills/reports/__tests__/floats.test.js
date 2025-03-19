const moment = require("moment");
moment.locale("en-gb");

// Mock data
const mockTillActivity = [
  {
    timestamp: "2019-07-10 10:48:29",
    counted_float: 84.6,
    expected_float: 84.6,
    opening: 0,
    note: null,
    user_id: "848148592500",
  },
  {
    timestamp: "2019-07-10 10:47:17",
    counted_float: 70.0,
    opening: 1,
    note: null,
    user_id: "848148592500",
  },
  {
    timestamp: "2020-12-11 18:13:32",
    counted_float: 30.0,
    expected_float: null,
    opening: 1,
    note: null,
    user_id: "9652067818400",
  },
];

const mockUsers = {
  848148592500: { name: "Test User 1" },
  9652067818400: { name: "Test User 2" },
};

describe("convertTillActivityToFloatsReport", () => {
  const { convertTillActivityToFloatsReport } = require("../handlers");

  it("should format a single closing activity correctly", async () => {
    const activity = [
      {
        timestamp: "2020-12-11 18:13:32",
        counted_float: 141.73,
        expected_float: 150.01,
        opening: 0,
        note: null,
        user_id: "9652067818400",
      },
    ];

    const result = await convertTillActivityToFloatsReport({
      activity,
      usersObj: mockUsers,
    });

    expect(result).toEqual([
      {
        timestamp: moment(activity[0].timestamp).format("L hh:mm A"),
        action: "Closing",
        summary: "Counted Float: £141.73<br />Expected Float: £150.01",
        discrepancy: "-8.28",
        note: "-",
        user: "Test User 2",
      },
    ]);
  });

  it("should format a single opening activity correctly", async () => {
    const activity = [
      {
        timestamp: "2019-07-10 10:48:29",
        counted_float: 70.0,
        expected_float: null,
        opening: 1,
        note: null,
        user_id: "848148592500",
      },
    ];

    const result = await convertTillActivityToFloatsReport({
      activity,
      usersObj: mockUsers,
    });

    expect(result).toEqual([
      {
        timestamp: moment(activity[0].timestamp).format("L hh:mm A"),
        action: "Opening",
        summary: "Counted Float: £70.00",
        discrepancy: "",
        note: "-",
        user: "Test User 1",
      },
    ]);
  });

  it("should detect and add transfer to safe entries", async () => {
    const result = await convertTillActivityToFloatsReport({
      activity: mockTillActivity,
      usersObj: mockUsers,
    });

    expect(result).toHaveLength(4); // 3 original activities + 1 transfer
    expect(result).toEqual([
      {
        timestamp: "11/12/2020 06:13 PM",
        action: "Opening",
        summary: "Counted Float: £30.00",
        discrepancy: "",
        note: "-",
        user: "Test User 2",
      },
      {
        action: "Transfer to Safe",
        summary: "Implied cash to safe: £14.60",
        discrepancy: "",
        transferToFromTill: "-14.60",
      },
      {
        timestamp: "10/07/2019 10:48 AM",
        action: "Closing",
        summary: "Counted Float: £84.60<br />Expected Float: £84.60",
        discrepancy: "0.00",
        note: "-",
        user: "Test User 1",
      },
      {
        timestamp: "10/07/2019 10:47 AM",
        action: "Opening",
        summary: "Counted Float: £70.00",
        discrepancy: "",
        note: "-",
        user: "Test User 1",
      },
    ]);
  });

  it("should handle notes when present", async () => {
    const activity = [
      {
        timestamp: "2020-12-11 18:13:32",
        counted_float: 141.73,
        expected_float: 150.01,
        opening: 0,
        note: "Short due to refund",
        user_id: "9652067818400",
      },
    ];

    const result = await convertTillActivityToFloatsReport({
      activity,
      usersObj: mockUsers,
    });

    expect(result[0].note).toBe("Short due to refund");
  });

  it("should handle unknown users", async () => {
    const activity = [
      {
        timestamp: "2020-12-11 18:13:32",
        counted_float: 141.73,
        expected_float: 150.01,
        opening: 0,
        note: null,
        user_id: "unknown_id",
      },
    ];

    const result = await convertTillActivityToFloatsReport({
      activity,
      usersObj: mockUsers,
    });

    expect(result[0].user).toBe("Unknown User");
  });
});
