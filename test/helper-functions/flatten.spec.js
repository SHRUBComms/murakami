require("dotenv").config();
const assert = require("chai").assert;
const flatten = require(process.env.CWD + "/app/helper-functions/flatten");

const sampleTree = [
  { children: [{ children: [{ bar: false }] }], foo: true },
  { children: [], something: "hello" },
];

describe("Helpers.flatten", function () {
  it("should return an array", function () {
    const result = flatten(sampleTree);
    assert.typeOf(result, "array");
  });

  it("should return an array of length ", function () {
    const result = flatten(sampleTree);
    assert.lengthOf(result, 4);
  });

  //To-do: Verify result is one dimensional
});
