require("dotenv").config();
const assert = require("chai").assert;
const generateIntId = require(process.env.CWD + "/app/helper-functions/generateIntId");

describe("Helpers.generateIntId", function () {
  it("should return a number", function () {
    const id = generateIntId(10);
    assert.typeOf(id, "number");
  });

  it("should return a number of 11 characters long", function () {
    const id = generateIntId(11).toString();
    assert.lengthOf(id, 11);
  });
  // To-do: find out what the length limit is of casting number to string.
  // Limit of INT type in MySQL is 11.
});
