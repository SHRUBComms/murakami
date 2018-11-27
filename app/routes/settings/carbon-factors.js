// /settings/carbon-factors

var router = require("express").Router();

var rootDir = process.env.CWD;

var Carbon = require(rootDir + "/app/models/carbon-calculations");

var Auth = require(rootDir + "/app/configs/auth");

router.get("/", Auth.isLoggedIn, Auth.isOfClass(["admin"]), function(req, res) {
  Carbon.getCategories(function(err, carbonCategories) {
    res.redirect("/settings/carbon-factors/" + carbonCategories[Object.keys(carbonCategories)[0]].carbon_id);
  });
});

router.get("/:carbon_id", Auth.isLoggedIn, Auth.isOfClass(["admin"]), function(req, res) {
  Carbon.getCategories(function(err, carbonCategories) {
    var carbon_id = req.params.carbon_id;
    if(carbonCategories[carbon_id]){
      res.render("settings/carbon-calculations", {
        title: "Carbon Calculation Factors",
        carbonActive: true,
        carbonCategories: carbonCategories,
        selectedCategory: carbonCategories[carbon_id]
      });
    }
  });
});

router.post("/:carbon_id", Auth.isLoggedIn, Auth.isOfClass(["admin"]), function(req, res) {
  var factors = req.body.factors;
  var carbon_id = req.params.carbon_id;
  var sanitizedFactors = {};

  Carbon.getCategoryById(carbon_id, function(err, category) {
    if (!err || category) {
      var validMethods = [
        "recycled",
        "generated",
        "landfilled",
        "incinerated",
        "composted",
        "reused",
        "stored"
      ];
      Object.keys(category.factors).forEach(function(key, value) {
        if (validMethods.indexOf(key) !== -1 && !isNaN(factors[key])) {
          category.factors[key] = factors[key] || 0;
        }
      });
      category.factors = JSON.stringify(category.factors);
      Carbon.updateCategory(category, function(err) {
        if (err) {
          req.flash("error_msg", "Something went wrong!");
          res.redirect("/settings/carbon-factors/" + category.carbon_id);
        } else {
          req.flash("success_msg", "Factors successfully updated!");
          res.redirect("/settings/carbon-factors/" + category.carbon_id);
        }
      });
    } else {
      req.flash("error_msg", "Select a valid category.");
      res.redirect("/settings/carbon-factors/IT-100");
    }
  });
});

module.exports = router;
