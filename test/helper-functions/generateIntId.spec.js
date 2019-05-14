require("dotenv").config();
var assert = require("chai").assert;
var generateIntId = require(process.env.CWD +
  "/app/helper-functions/generateIntId");

describe("Helpers.generateIntId", function() {
  it("should return an integer", function() {
    var id = generateIntId(10);
    assert.typeOf(id, "number");
  });
  it("should return an integer of 11 chars long", function() {
    var id = generateIntId(11).toString();
    assert.lengthOf(id, 11);
  });
  // To-do: find out what the length limit is of casting number to string.
  // Limit of INT type in MySQL is 11.
});
