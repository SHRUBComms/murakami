require("dotenv").config();
var assert = require("chai").assert;
var allBelongTo = require(process.env.CWD +
  "/app/helper-functions/calculateCarbon");

var carbonCategories = {
  "IT-100": { factors: { recycled: 2 } },
  "IT-101": { factors: { recycled: 4 } }
};

describe("Helpers.calculateCarbon", function() {
  it("should return a number even if transaction and categories are empty", function() {
    allBelongTo([], {}, function(totalCarbon) {
      assert.typeOf(totalCarbon, "number");
    });
  });

  it("should return a 150", function() {
    allBelongTo(
      [{ method: "recycled", trans_object: { "IT-100": 25, "IT-101": 25 } }],
      carbonCategories,
      function(totalCarbon) {
        assert.equal(totalCarbon, 150);
      }
    );
  });

  it("should return a 300", function() {
    allBelongTo(
      [
        { method: "recycled", trans_object: { "IT-100": 25, "IT-101": 25 } },
        { method: "recycled", trans_object: { "IT-100": 75 } }
      ],
      carbonCategories,
      function(totalCarbon) {
        assert.equal(totalCarbon, 300);
      }
    );
  });
});
