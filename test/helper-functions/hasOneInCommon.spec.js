require("dotenv").config();
var assert = require("chai").assert;
var hasOneInCommon = require(process.env.CWD +
  "/app/helper-functions/hasOneInCommon");

describe("Helpers.hasOneInCommon", function() {
  it("should return boolean", function() {
    var result = hasOneInCommon([1, 2, 3], [3, 4, 5]);
    assert.typeOf(result, "boolean");
  });

  it("should return true", function() {
    var result = hasOneInCommon([1, 2, 3], [3, 4, 5]);
    assert.equal(result, true);
  });

  it("should return false", function() {
    var result = hasOneInCommon([1, 2, 3], [4, 5, 6]);
    assert.equal(result, false);
  });

  it("should return false (both arguments not arrays and not identical)", function() {
    var result = hasOneInCommon("hello", 123);
    assert.equal(result, false);
  });

  it("should return true (both arguments not arrays but identical)", function() {
    var result = hasOneInCommon("hello", "hello");
    assert.equal(result, true);
  });
});
