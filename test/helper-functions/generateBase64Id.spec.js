require("dotenv").config();
const assert = require("chai").assert;
const generateBase64Id = require(process.env.CWD + "/app/helper-functions/generateBase64Id");

describe("Helpers.generateBase64Id", function () {
  it("should return a string", function () {
    const id = generateBase64Id(10);
    assert.typeOf(id, "string");
  });
  it("should return a string of 10 chars long", function () {
    const id = generateBase64Id(10);
    assert.lengthOf(id, 10);
  });
});
