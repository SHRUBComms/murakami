require("dotenv").config();
var assert = require("chai").assert;
var allBelongTo = require(process.env.CWD +
  "/app/helper-functions/allBelongTo");

describe("Helpers.allBelongTo", function() {
  it("should return a boolean value", function() {
    var result = allBelongTo([1, 2, 3], [1, 2, 3, 4, 5]);
    assert.typeOf(result, "boolean");
  });
  it("should return false", function() {
    var result = allBelongTo([1, 2, 6], [1, 2, 3, 4, 5]);
    assert.equal(result, false);
  });
  it("should return true", function() {
    var result = allBelongTo([1, 2, 3], [1, 2, 3, 4, 5]);
    assert.equal(result, true);
  });

  it("should return true", function() {
    var result = allBelongTo(1, [1, 2, 3, 4, 5]);
    assert.equal(result, true);
  });

  // Incorrect param data types.
  it("should return false", function() {
    var result = allBelongTo(1, "foo");
    assert.equal(result, false);
  });
});
