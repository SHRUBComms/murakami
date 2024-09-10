require("dotenv").config();
const assert = require("chai").assert;
const flattenToIds = require(process.env.CWD + "/app/helper-functions/flattenToIds");

describe("Helpers.flattenToIds", function () {
  describe("with valid params", function () {
    it("should return an array", function () {
      flattenToIds(
        [
          { uid: "1234abcd", foo: "adsjcbsc" },
          { uid: "5678efgh", foo: "adsjcbsc" },
        ],
        "uid",
        function (result) {
          assert.typeOf(result, "array");
        }
      );
    });

    it("should return an array of length 2", function () {
      flattenToIds(
        [
          { uid: "1234abcd", foo: "adsjcbsc" },
          { uid: "5678efgh", foo: "adsjcbsc" },
        ],
        "uid",
        function (result) {
          assert.lengthOf(result, 2);
        }
      );
    });
  });

  describe("with empty or invalid params", function () {
    it("should return an array", function () {
      flattenToIds([], "", function (result) {
        assert.typeOf(result, "array");
      });
    });

    it("should return an empty array", function () {
      flattenToIds([], "", function (result) {
        assert.lengthOf(result, "0");
      });
    });
  });

  //To-do: Check array is one dimensional
});
