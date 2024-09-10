require("dotenv").config();
const assert = require("chai").assert;
const hasOneInCommon = require(process.env.CWD + "/app/helper-functions/hasOneInCommon");

describe("Helpers.hasOneInCommon", function () {
  it("should return boolean", function () {
    const result = hasOneInCommon([1, 2, 3], [3, 4, 5]);
    assert.typeOf(result, "boolean");
  });

  it("should return true when there is at least one common value", function () {
    const result = hasOneInCommon([1, 2, 3], [3, 4, 5]);
    assert.equal(result, true);
  });

  it("should return false when there are no common values", function () {
    const result = hasOneInCommon([1, 2, 3], [4, 5, 6]);
    assert.equal(result, false);
  });

  it("should return false when both arguments are not arrays and not identical", function () {
    const result = hasOneInCommon("hello", 123);
    assert.equal(result, false);
  });

  it("should return true when both arguments are not arrays but identical", function () {
    const result = hasOneInCommon("hello", "hello");
    assert.equal(result, true);
  });
});
