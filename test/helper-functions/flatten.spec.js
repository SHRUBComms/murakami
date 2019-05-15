require("dotenv").config();
var assert = require("chai").assert;
var flatten = require(process.env.CWD + "/app/helper-functions/flatten");

var sampleTree = [
  { children: [{ children: [{ bar: false }] }], foo: true },
  { children: [], something: "hello" }
];

describe("Helpers.flatten", function() {
  it("should return an array", function() {
    var result = flatten(sampleTree);
    assert.typeOf(result, "array");
  });

  it("should return an array of length ", function() {
    var result = flatten(sampleTree);
    assert.lengthOf(result, 4);
  });

  //To-do: Verify result is one dimensional
});
