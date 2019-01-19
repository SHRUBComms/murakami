// /get-carbon-calculations

var router = require("express").Router();

router.get("/", function(req, res) {
  res.redirect("/api/get/reports/all-time/carbon-saved");
});

module.exports = router;
