require("dotenv").config();
var assert = require("chai").assert;
var allBelongTo = require(process.env.CWD +
  "/app/helper-functions/calculateCarbon");

var carbonCategories = {
  "IT-100": { factors: { recycled: 2, reused: 1 } },
  "IT-101": { factors: { recycled: 4, reused: 2 } },
  "IT-102": { factors: { recycled: 6, reused: 3 } },
  "IT-103": { factors: { recycled: 8, reused: 4 } }
};

describe("Helpers.calculateCarbon", function() {
  it("should return a number", function() {
    allBelongTo([], {}, function(totalCarbon) {
      assert.typeOf(totalCarbon, "number");
    });
  });

  it("should return 0 when no valid data is given", function() {
    allBelongTo([], {}, function(totalCarbon) {
      assert.typeOf(totalCarbon, "number");
    });
  });

  it("should return 300 (sample calculation)", function() {
    allBelongTo(
      [
        {
          method: "recycled",
          trans_object: {
            "IT-100": 10,
            "IT-101": 10,
            "IT-102": 10,
            "IT-103": 10
          }
        },
        {
          method: "reused",
          trans_object: {
            "IT-100": 10,
            "IT-101": 10,
            "IT-102": 10,
            "IT-103": 10
          }
        }
      ],
      carbonCategories,
      function(totalCarbon) {
        assert.equal(totalCarbon, 300);
      }
    );
  });
});
