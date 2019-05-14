require("dotenv").config();
var assert = require("chai").assert;
var flattenToIds = require(process.env.CWD +
  "/app/helper-functions/flattenToIds");

describe("Helpers.flattenToIds", function() {
  it("should return an array", function() {
    flattenToIds(
      [
        { uid: "1234abcd", foo: "adsjcbsc" },
        { uid: "5678efgh", foo: "adsjcbsc" }
      ],
      "uid",
      function(result) {
        assert.typeOf(result, "array");
      }
    );
  });

  it("should return an array of length 2", function() {
    flattenToIds(
      [
        { uid: "1234abcd", foo: "adsjcbsc" },
        { uid: "5678efgh", foo: "adsjcbsc" }
      ],
      "uid",
      function(result) {
        assert.lengthOf(result, 2);
      }
    );
  });

  it("should return an array with empty params", function() {
    flattenToIds([], "", function(result) {
      assert.typeOf(result, "array");
    });
  });

  // Check array is one dimensional
});
