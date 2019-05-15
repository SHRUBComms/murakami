require("dotenv").config();
var assert = require("chai").assert;
var generateBase64Id = require(process.env.CWD +
  "/app/helper-functions/generateBase64Id");

describe("Helpers.generateBase64Id", function() {
  it("should return a string", function() {
    var id = generateBase64Id(10);
    assert.typeOf(id, "string");
  });
  it("should return a string of 10 chars long", function() {
    var id = generateBase64Id(10);
    assert.lengthOf(id, 10);
  });
});
