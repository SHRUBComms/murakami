require("dotenv").config();
const assert = require("chai").assert;
const getCommonItemsInArray = require(
  process.env.CWD + "/app/helper-functions/getCommonItemsInArray"
);

describe("Helpers.getCommonItemsInArray", function () {
  it("should return an array", function () {
    const result = getCommonItemsInArray([1, 2, 3], [1, 2, 3, 4, 5]);
    assert.typeOf(result, "array");
  });

  it("should return a subset of the scond array", function () {
    const result = getCommonItemsInArray([1, 2, 3], [1, 2, 3, 4, 5]);
    assert.deepEqual(result, [1, 2, 3]);
  });

  it("should return an empty array", function () {
    const result = getCommonItemsInArray([6, 7, 8], [1, 2, 3, 4, 5]);
    assert.deepEqual(result, []);
  });
});
